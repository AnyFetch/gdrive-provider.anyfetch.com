'use strict';

var googleapis = require('googleapis');
var async = require('async');

var config = require('../config/configuration.js');
var retrieveFiles = require('./helpers/retrieve.js');
var selectBestDownload = require('./helpers/select-best-download.js');

module.exports = function updateAccount(serviceData, cursor, queues, cb) {
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
          if(cursor) {
            queues.deletion.push({
              title: id,
              identifier: id
            });
          }
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
