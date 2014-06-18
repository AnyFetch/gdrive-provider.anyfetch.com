"use strict";

var async = require('async');
var gApis = require('googleapis');
var AnyFetch = require('anyfetch');
var url =require('url');
var request = require('supertest');

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
        var token = tokenResponse.access_token;
        var components = url.parse(job.data.url, true);
        request(components.protocol + '//' + components.host)
          .get(components.pathname)
          .query(components.query)
          .set("Authorization", "Bearer " + token)
          .end(cb);
      },
      function sendFile(fileResponse, cb) {
        var fileBuffer = new Buffer(fileResponse.text, 'binary');
        var fileConfig = {
          file: job.data.type === "document" ? fileBuffer.toString() : fileBuffer,
          filename: job.data.title,
          knownLength: job.data.type === "document" ? fileBuffer.toString().length : fileBuffer.length
        };
        var document = {
          identifier: job.data.id,
          actions: {
            show: job.data.showAction
          },
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
