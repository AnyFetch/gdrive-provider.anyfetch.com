'use strict';
/**
 * @file Retrieve files from the account
 */
var async = require('async');
var gapis = require('googleapis');
var request = require('request');

/**
 * Get the google API object
 *
 * @param {Object} tokens What you already got when it comes to tokens
 * @param {Object} config The app's config (app id + secret !)
 * @param {Function} cb First the error, then google api object, then the google auth object
 */
var getDriveApi = function(tokens, config, cb) {
  var auth = new gapis.OAuth2Client(config.gdrive_id, config.gdrive_secret, config.gdrive_connect);
  gapis.discover('drive', 'v2').execute(function(err, client) {
    if(err) {
      return cb(err);
    }

    auth.credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
    cb(null, client.drive, auth);
  });
};

/**
 * Use the Google refresh token to get a new accessToken,
 *
 * @param {String} refreshToken Refresh token issued by Google
 * @param {Function} cb First parameter is the error (if any), then the new accessToken (valid for one hour)
 */
var refreshAccessToken = function(refreshToken, config, cb) {

  // See https://developers.google.com/accounts/docs/OAuth2WebServer#refresh for details
  var params = {
    url: 'https://accounts.google.com/o/oauth2/token',
    form: {
      'refresh_token': refreshToken,
      'client_id': config.google_drive_id,
      'client_secret': config.google_drive_secret,
      'grant_type': 'refresh_token'
    },
    json: true
  };

  request.post(params, function (err, res) {
    if(err) {
      return cb(err);
    }

    if(res.statusCode === 401) {
      return cb(new Error("Access to this refresh_token has been revoked."));
    }
    if(res.statusCode !== 200) {
      return cb(new Error("Google Error: " + JSON.stringify(res.body, null, ' ')));
    }

    cb(null, res.body);
  });
};


var processFiles = function(files, isFirstRun) {
  var fileMap = {};
  for(var i = 0; i < files.length; i += 1) {
    var item = files[i];
    var file = item.file;
    if(file) {
      file.deleted = false;
      if(file.labels.trashed) {
        fileMap[item.fileId] = {
          id: item.fileId,
          deleted: true
        };
      } else {
        fileMap[item.fileId] = file;
      }
    } else if(!isFirstRun) {
      fileMap[item.fileId] = {
        id: item.fileId,
        deleted: true
      };
    }
  }

  var tasks = [];
  for(var id in fileMap) {
    files.push(fileMap[id]);
  }

  return tasks;
};


var retrieveChanges = function(drive, auth, options, startChangeId, cb) {
  var handleRequestResults = function(err, resp) {
    if(err) {
      return cb(err);
    }

    var files = resp.items;
    var nextPageToken = resp.nextPageToken;

    var tasks = processFiles(files, startChangeId ? true : false);

    if(nextPageToken) {
      request = drive.changes.list({
        'pageToken': nextPageToken
      }).withAuthClient(auth);

      // Immediately start sending tasks
      cb(null, tasks);
      request.execute(handleRequestResults);
    }
    else {
      // We're done.
      cb(null, tasks, nextPageToken);
    }
  };

  var request = drive.changes.list(options).withAuthClient(auth);

  request.execute(handleRequestResults);
};

/**
 * Retrieve all files associated with this user account,
 *
 * @param {Object} tokens OAuth Tokens to identify the account
 * @param {String} cursor Last cursor
 * @param {Function} cb Callback. First parameter is the error (if any), then the files metadatas, then the new cursor.
 */
module.exports = function(refreshToken, startChangeId, config, done) {
  var tokens;
  async.waterfall([
    function getAccessToken(cb) {
      refreshAccessToken(refreshToken, config, cb);
    },
    function retrieveDriveApi(_tokens, cb) {
      tokens = _tokens;
      getDriveApi(tokens, config, cb);
    },
    function retrieveFirstPage(drive, auth, cb) {
      var options = {
        maxResults: 1000
      };
      if(startChangeId) {
        options.startChangeId = startChangeId;
      }

      retrieveChanges(drive, auth, options, startChangeId, cb);
    },
    function storeTokensOnFiles(files, lastChangeId, cb) {
      for(var i = 0; i < files.length; i += 1) {
        files[i].authTokens = tokens;
      }
      cb(null, files, lastChangeId);
    }
  ], done);
};
