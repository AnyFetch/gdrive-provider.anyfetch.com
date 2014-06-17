"use strict";

var async = require('async');
var gApis = require('googleapis');
var rarity = require('rarity');

var PREFIX = "http://gdrive.provider.anyfetch.com";

module.exports = function(app) {
  var queue = app.get('queue');

  return function(job, done) {
    async.waterfall([
      function discoverApi(cb) {
        gApis.discover('drive', 'v2').execute(cb);
      },
      function setup(client, cb) {
        var authClient = app.get('googleOAuth');
        authClient.credentials = {
          access_token: "to_renew",
          refresh_token: job.data.providerToken
        };
        var options = {
          maxResults: 1000,
          startChangeId: job.data.cursor,
          includeDeleted: (!! job.data.cursor)
        };
        cb(null, [], options, client, authClient);
      },
      function retrievePageOfChanges(changes, options, client, authClient, cb) {
        client.drive.changes
          .list(options)
          .withAuthClient(authClient)
          .execute(function mergePageOfChanges(err, res) {
            if(err || !res) {
              return cb(err, res);
            }

            changes = changes.concat(res.items);
            if(res.nextPageToken) {
              options.pageToken = res.nextPageToken;
              retrievePageOfChanges(changes, options, client, authClient, cb);
            } else {
              cb(null, changes);
            }
          });
      },
      function squashFiles(changes, cb) {
        var lastChangeId = changes[changes.length -1].id;
        async.reduce(changes, {}, function reduceFile(files, change, cb) {
          files[PREFIX + change.file.id] = change.deleted?{deleted: true}:change.file;
          cb(null, files);
        }, rarity.carry([lastChangeId], cb));
      },
      function spawnUploadJobs(lastChangeId, files, cb) {
        for(var id in files) {
          var file = files[id];
          if(file.deleted) {
            queue.create('deletion', {
              title: "Delete " + id,
              anyfetchToken: job.data.anyfetchToken,
              id: id
            }).priority('high').attempts(5);
          } else {
            queue.create('upload', {
              title: "Upload " + file.title,
              anyfetchToken: job.data.anyfetchToken,
              id: id
            }).priority('high').attempts(5);
          }
        }
        cb(null, lastChangeId);
      }
    ], done);
  };
};
