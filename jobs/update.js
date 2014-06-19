"use strict";

var async = require('async');
var gApis = require('googleapis');
var retrieveAllChanges = require('../helpers/retrieve-all-changes.js');
var spawnSubjobs = require('../helpers/spawn-subjobs.js');

module.exports = function(app) {
  return function(job, done) {
    async.waterfall([
      function discoverApi(cb) {
        gApis.discover('drive', 'v2').execute(cb);
      },
      function retrieveChanges(client, cb) {
        var options = {
          maxResults: 1000,
          includeDeleted: (!! job.data.cursor) // cast to bool
        };
        if(job.data.cursor) {
          options.startChangeId = job.data.cursor;
        }
        var authClient = new gApis.OAuth2Client(
          app.get('gdrive.apiId'),
          app.get('gdrive.apiSecret'),
          app.get('gdrive.redirectUri')
        );
        authClient.credentials = {
          access_token: "to_renew",
          refresh_token: job.data.providerToken
        };
        retrieveAllChanges(options, client, authClient, spawnSubjobs(job, app), cb);
      }
    ], done);
  };
};
