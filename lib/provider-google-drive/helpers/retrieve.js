'use strict';
/**
 * @file Retrieve files from the account
 */

var gapis = require('googleapis');
var request = require('request');

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
      return cb(new Error("Google Error: " + res.body.message));
    }

    cb(null, res.body);
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
    getApi(tokens, config, function(drive, auth) {
      var processDelta = function(items) {
        var files = [];
        for(var i = 0; i < items.length; i += 1) {
          var item = items[i];
          var file = item.file;
          if(file && file.fileSize < 50 * 1000000) {
            file.deleted = false;
            files.push(file);
          } else {
            files.push({
              id: item.fileId,
              deleted: true
            });
          }
        }

        if(items.length > 0) {
          cb(null, files, items[0].id);
        } else {
          cb(null, [], startChangeId);
        }
      };

      var retrievePageOfChanges = function(request, results) {
        request.execute(function(resp) {
          results = results.concat(resp.items);
          var nextPageToken = resp.nextPageToken;
          if (nextPageToken) {
            request = drive.changes.list({
              'pageToken': nextPageToken
            }).withAuthClient(auth);
            retrievePageOfChanges(request, results);
          } else {
            processDelta(results);
          }
        });
      };

      var options = {
        maxResults: 1000
      };
      if(startChangeId) {
        options.startChangeId = startChangeId;
      }

      var request = drive.changes.list(options).withAuthClient(auth);
      retrievePageOfChanges(request, []);
    });
  });
};
