"use strict";

var async = require('async');
var gApis = require('googleapis');
var AnyFetch = require('anyfetch');
var url = require('url');
var request = require('supertest');
var stream = require('stream');

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
      function downloadAndSendFile(tokenResponse, reqObj, cb) {
        var urlData = url.parse(job.data.downloadUrl);

        var r = request(urlData.protocol + '//' + urlData.host)
          .get(urlData.path)
          .set('Authorization', 'Bearer ' + tokenResponse.access_token);

        cb(null, r);
      },
      function sendFile(req, cb) {
        var fileConfig = function() {
          var streamer = new stream.PassThrough();
          req.pipe(streamer);
          req.end();
          return {
            file: streamer,
            filename: job.data.title
          };
        };

        var document = {
          identifier: job.data.id,
          actions: {
            show: job.data.id
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
        anyfetchAuthClient.sendDocumentAndFile(document, fileConfig, cb);
      },
      function formatSuccess(res, cb) {
        cb(null, res.identifier);
      }
    ], done);
  };
};
