'use strict';
/**
 * @file Retrieve files from the account
 */

var gapis = require('googleapis');
var request = require('request');

/**
 * Get the google API object
 *
 * @param {Object} tokens What you already got when it comes to tokens
 * @param {Object} tokens The app's config (app id + secret !)
 * @param {Function} cb First the google api object, then the google auth object
 */
var getApi = function(tokens, config, cb) {
  var auth = new gapis.OAuth2Client(config.gdrive_id, config.gdrive_secret, config.gdrive_connect);
  gapis.discover('drive', 'v2').execute(function(err, client) {
    if(err) {
      return cb(err);
    }

    auth.credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
    cb(client.drive, auth);
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
    if(err){
      return cb(err);
    }

    if(res.statusCode === 401){
      return cb(new Error("Access to this refresh_token has been revoked."));
    }
    if(res.statusCode !== 200) {
      return cb(new Error("Google Error: " + JSON.stringify(res.body, null, ' ')));
    }

    cb(null, res.body);
  });
};

/**
 * Process a list of changes (used as a callback)
 *
 * @param {Error} err A possible error rose during precedent execution
 * @param {Array} items An array of items of changes
 * @param {Boolean} end Is this the last delta you want to send ?
 * @param {Boolean} init Define if it works for initialization
 * @param {Function} cb The callback
 */
var processDelta = function(err, items, end, init, cb) {
  if(err) {
    return cb(err);
  }
  var files = [];
  for(var i = 0; i < items.length; i += 1) {
    var item = items[i];
    var file = item.file;
    if(file) {
      file.deleted = false;
      files.push(file);
    } else if(!init) {
      files.push({
        id: item.fileId,
        deleted: true
      });
    }
  }

  if(items.length > 0) {
    if(end) {
      cb(null, files, items[items.length -1].id);
    } else {
      cb(null, files);
    }
  } else {
    cb(null, [], startChangeId);
  }
};

/**
 * Retrieve recursively pages of changes
 *
 * @param {GoogleApi.DriveApi} drive The drive API
 * @param {GoogleApi.Auth} auth The auth Object
 * @param {GoogleApi.Request} request The last request done (or false)
 * @param {Boolean} init Define if it works for initialization
 * @param {Function} cb Callback, when every page is passed
 */
var retrievePageOfChanges = function(drive, auth, options, request, init, cb) {
  if(!request) {
    request = drive.changes.list(options).withAuthClient(auth);
  }
  var results = [];
  request.execute(function(err, resp) {
    if(err) {
      return cb(err);
    }
    results = resp.items;
    var nextPageToken = resp.nextPageToken;
    if (nextPageToken) {
      request = drive.changes.list({
        'pageToken': nextPageToken
      }).withAuthClient(auth);
      processDelta(null, results, false, init, cb);
      retrievePageOfChanges(drive, auth, options, request, init, cb);
    } else {
      processDelta(null, results, true, init, cb);
    }
  });
};

/**
 * Retrieve all files associated with this user account,
 *
 * @param {Object} tokens OAuth Tokens to identify the account
 * @param {String} cursor Last cursor
 * @param {Function} cb Callback. First parameter is the error (if any), then the files metadatas, then the new cursor.
 */
module.exports = function(refreshToken, startChangeId, config, cb) {
  refreshAccessToken(refreshToken, config, function(err, tokens) {
    if(err) {
      return cb(err);
    }
    getApi(tokens, config, function(drive, auth) {
      var options = { maxResults: 1000 };
      var init = false;
      if(startChangeId) {
        options.startChangeId = startChangeId;
      } else {
        init = true;
      }
      
      retrievePageOfChanges(drive, auth, options, false, init, cb);
    });
  });
};
