'use strict';

var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;

var retrieveFiles = require('./helpers/retrieve.js');
var uploadFiles = require('./helpers/upload.js');

module.exports = function(config) {
  var init = function(req, next) {
    googleapis.execute(function(err) {
      if(err) {
        return next(err);
      }

      var oauth2Client = new OAuth2Client(config.gdrive_id, config.gdrive_secret, config.gdrive_callback);

      // generate consent page url for Google Drive access, even when user is not connected (offline)
      var redirectUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/drive',
        approval_prompt: "force"
      });

      redirectUrl += '&state=' + req.params.code;

      next(null, {code: req.params.code}, redirectUrl);
    });
  };

  var retrievePreDatasIdentifier = function(req, next) {
    if(!req.params.state) {
      return next("State parameter left out of query.");
    }

    next(null, {'datas.code': req.params.state});
  };

  var retrieveAuthDatas = function(req, preDatas, next) {
    var oauth2Client = new OAuth2Client(config.google_id, config.google_secret, config.google_callback);
    // request tokens set
    oauth2Client.getToken(req.params.code, function(err, tokens) {
      if(err) {
        return next(new Error(err));
      }

      // Google only send refresh token once, the first time.
      if(!tokens.refresh_token) {
        return next(new Error("You're already subscribed to anyFetch. To subscribe again, please revoke the permission from your Google Account."));
      }

      // Set tokens to the client
      // Not really useful in our case.
      oauth2Client.credentials = tokens;

      next(null, tokens.refresh_token);
    });
  };

  var update = function(datas, cursor, next) {
    // Retrieve all contacts since last call
    if(!cursor) {
      cursor = 0;
    }

    retrieveFiles(datas, cursor, config, next);
  };

  return {
    initAccount: init,
    connectAccountRetrievePreDatasIdentifier: retrievePreDatasIdentifier,
    connectAccountRetrieveAuthDatas: retrieveAuthDatas,
    updateAccount: update,
    queueWorker: uploadFiles,

    cluestrAppId: config.cluestr_id,
    cluestrAppSecret: config.cluestr_secret,
    connectUrl: config.google_drive_connect
  };
};
