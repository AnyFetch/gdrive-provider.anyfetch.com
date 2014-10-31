'use strict';
/**
 * This object contains all the handlers to use for this providers
 */
var googleapis = require('googleapis');
var rarity = require('rarity');
var async = require('async');
var CancelError = require('anyfetch-provider').CancelError;

var config = require('../config/configuration.js');
var retrieveFiles = require('./helpers/retrieve.js');
var uploadFile = require('./helpers/upload.js');
var deleteFile = require('./helpers/delete.js');
var selectBestDownload = require('./helpers/select-best-download.js');

var redirectToService = function(callbackUrl, cb) {
  var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, callbackUrl);

  // generate consent page url for Google Drive access, even when user is not connected (offline)
  var redirectUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
    approval_prompt: 'force', // Force resending a refresh_token
  });

  cb(null, redirectUrl, {callbackUrl: callbackUrl});
};

var retrieveTokens = function(reqParams, storedParams, cb) {
  if(reqParams.error === "access_denied") {
    return cb(new CancelError());
  }
  
  async.waterfall([
    function getToken(cb) {
      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, storedParams.callbackUrl);
      oauth2Client.getToken(reqParams.code, rarity.carryAndSlice([oauth2Client], 3, cb));
    },
    function getUserInfo(oauth2Client, tokens, cb) {
      oauth2Client.credentials = tokens;
      googleapis.oauth2('v2').userinfo.get({auth: oauth2Client}, rarity.carryAndSlice([tokens], 3, cb));
    },
    function callFinalCb(tokens, data, cb) {
      cb(null, data.email, {tokens: tokens, callbackUrl: storedParams.callbackUrl});
    }
  ], function(err) {
    if(err && err.toString().match(/backend/i)) {
      return retrieveTokens(reqParams, storedParams, cb);
    }

    cb(err);
  });
};

var updateAccount = function(serviceData, cursor, queues, cb) {
  // Retrieve all files since last call
  async.waterfall([
    function refreshTokens(cb) {
      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, serviceData.callbackUrl);
      oauth2Client.refreshToken_(serviceData.tokens.refresh_token, function(err, tokens) {
        if(err) {
          return cb(err);
        }
        
        if(typeof tokens !== 'object' || !tokens.access_token) {
          return cb(new Error("Can't refresh tokens"));
        }

        tokens.refresh_token = serviceData.tokens.refresh_token;
        serviceData.tokens = tokens;
        cb(err);
      });
    },
    function retrieveChanges(cb) {
      var options = {
        maxResults: 1000,
      };

      if(cursor && cursor.id) {
        options.startChangeId = cursor.id;
      }

      options.includeDeleted = (cursor) ? true : false;

      var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, serviceData.callbackUrl);
      oauth2Client.credentials = serviceData.tokens;
      options.auth = oauth2Client;

      retrieveFiles(options, [], cb);
    },
    function applyChanges(newCursor, changes, cb) {
      newCursor.date = new Date();

      changes.forEach(function(change) {
        var id = "https://docs.google.com/file/d/" + change.fileId;

        if(change.deleted || (cursor && change.file.labels.trashed)) {
          queues.deletion.push({
            title: id,
            identifier: id
          });
        }
        else {
          var download = selectBestDownload(change.file);

          // When retrieving a GDrive file, GDrive updates the file cursor and resend it to us on next update
          // We don't need to reindex, so we first check modifiedDate with the last cursor date to skip it if necessary
          if(download.url && !change.file.labels.trashed &&
            (!change.file.fileSize || change.file.fileSize < config.maxSize * 1024 * 1024) &&
            (!cursor || !cursor.date || new Date(change.file.modifiedDate) > cursor.date)) {
            queues.addition.push({
              title: change.file.title + ((change.file.title.indexOf(download.extension) === -1) ? download.extension : ''),
              downloadUrl: download.url,
              type: download.type,
              createdDate: change.file.createdDate,
              modifiedDate: change.file.modifiedDate,
              starred: change.file.labels.starred,
              identifier: id,
              exported: true,
              link: change.file.alternateLink
            });
          }
        }
      });
      
      cb(null, newCursor, serviceData);
    }
  ], cb);
};

var additionQueueWorker = function(job, cb) {
  console.log("Uploading", job.task.title);
  uploadFile(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

var deletionQueueWorker = function(job, cb) {
  console.log("Deleting", job.task.title);
  deleteFile(job.task, job.anyfetchClient, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  });
};

additionQueueWorker.concurrency = config.concurrency;
deletionQueueWorker.concurrency = config.concurrency;

module.exports = {
  connectFunctions: {
    redirectToService: redirectToService,
    retrieveTokens: retrieveTokens
  },
  updateAccount: updateAccount,
  workers: {
    addition: additionQueueWorker,
    deletion: deletionQueueWorker
  },

  config: config
};
