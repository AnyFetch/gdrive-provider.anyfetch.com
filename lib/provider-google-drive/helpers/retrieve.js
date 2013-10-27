'use strict';
/**
 * @file Retrieve files from the account
 */

var gapis = require('googleapis');

var getApi = function(tokens, config, cb) {
  var auth = new gapis.OAuth2Client(config.gdrive_id, config.gdrive_secret, config.gdrive_connect);
  gapis.discover('drive', 'v2').execute(function(err, client) {
    if(err) {
      cb(err);
    } else {
      auth.credentials = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      };
      cb(client.drive, auth);
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
var changes = function(tokens, startChangeId, config, cb) {
  getApi(tokens, config, function(drive, auth) {
    var treatList = function(items) {
      //TODO
    };
    
    var retrievePageOfChanges = function(request, result) {
      request.execute(function(resp) {
        result = result.concat(resp.items);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = drive.changes.list({
            'pageToken': nextPageToken
          }).withAuthClient(auth);
          retrievePageOfChanges(request, result);
        } else {
          treatList(result);
        }
      });
    }
    
    var options = {};
    if(startChangeId) {
      options.startChangeId = startChangeId;
    }
    var request = drive.changes.list(options).withAuthClient(auth);
  });
};

module.exports = changes;