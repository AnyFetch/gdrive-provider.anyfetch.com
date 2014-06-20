"use strict";

var async = require('async');
var gApis = require('googleapis');
var AnyFetch = require('anyfetch');
var rarity = require('rarity');
var url = require('url');
var https = require('https');

module.exports = function(app) {
  return function(job, done) {
    async.waterfall([
      function refreshToken(cb) {
        var authClient = new gApis.OAuth2Client(
          app.get('gdrive.apiId'),
          app.get('gdrive.apiSecret'),
          app.get('gdrive.redirectUri')
        );
        authClient.refreshToken_(job.data.providerToken, cb);
      },
      function downloadFile(tokenResponse, reqObj, cb) {
        var options = url.parse(job.data.downloadUrl);
        options.headers = {
          'Authorization': 'Bearer ' + tokenResponse.access_token
        };
        var req = https.request(options, rarity.pad([null], cb));
        req.on('error', cb);
        req.end();
      },
      function sendFile(fileResponse, cb) {
        var fileConfig = function() {
          return {
            file: fileResponse,
            filename: job.data.title
          };
        };
        var document = {
          identifier: job.data.id,
          actions: {
            show: job.data.showAction
          },
          creation_date: job.data.date,
          metadata: {
            title: job.data.title,
            path: job.data.id + '/' + job.data.title
          },
          document_type: job.data.type,
          user_access: [job.data.anyfetchToken]
        };

        var anyfetchAuthClient = new AnyFetch(
          app.get('anyfetch.apiId'),
          app.get('anyfetch.apiSecret'),
          app.get('anyfetch.apiUrl'),
          app.get('anyfetch.managerUrl')
        );
        anyfetchAuthClient.setAccessToken(job.data.anyfetchToken);
        anyfetchAuthClient.sendDocumentAndFile(document, fileConfig(), cb);
      },
      function formatSuccess(res, cb) {
        cb(null, res.identifier);
      }
    ], done);
  };
};
