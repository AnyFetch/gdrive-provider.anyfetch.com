"use strict";

var async = require('async');
var rarity = require('rarity');
var gApis = require('googleapis');
var retrieveAllChanges = require('../helpers/retrieve-all-changes.js');
var spawnSubjobs = require('../helpers/spawn-subjobs.js');

module.exports = function(app) {
  var store = app.get('keyValueStore');

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
      },
      function setCursor(lastChange, cb) {
        store.hset('cursor', job.data.anyfetchToken, lastChange, rarity.carry([lastChange], cb));
      },
      function setLastUpdate(lastChange, status, cb) {
        store.hset('lastUpdate', job.data.anyfetchToken, Date.now().toString(), rarity.carry([lastChange], cb));
      },
      function unlockUpdate(lastChange, status, cb) {
        store.hdel('status', job.data.anyfetchToken, rarity.carry([lastChange], cb));
      },
      function formatResponse(lastChange, status, cb) {
        cb(null, lastChange);
      }
    ], done);
  };
};
