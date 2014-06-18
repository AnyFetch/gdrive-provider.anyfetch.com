"use strict";

var async = require('async');
var gApis = require('googleapis');
var retrieveAllChanges = require('../helpers/retrieve-all-changes.js');

var PREFIX = "http://gdrive.provider.anyfetch.com";

module.exports = function(app) {
  var queue = app.get('queue');

  return function(job, done) {
    async.waterfall([
      function discoverApi(cb) {
        gApis.discover('drive', 'v2').execute(cb);
      },
      function retrieveChanges(client, cb) {
        var options = {
          maxResults: 1000,
          startChangeId: job.data.cursor,
          includeDeleted: (!! job.data.cursor) // cast to bool
        };
        var authClient = app.get('googleOAuth');
        authClient.credentials = {
          access_token: "to_renew",
          refresh_token: job.data.providerToken
        };
        retrieveAllChanges(options, client, authClient, cb);
      },
      function squashFiles(changes, cb) {
        var lastChangeId = changes[changes.length -1].id;
        var files = changes.reduce(function reduceFile(files, change) {
          files[PREFIX + change.file.id] = change.deleted?{deleted: true}:change.file;
          return files;
        }, {});
        cb(null, lastChangeId, files);
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
