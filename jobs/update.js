"use strict";

var async = require('async');
var googleapis = require('googleapis');

var PREFIX = "http://gdrive.provider.anyfetch.com";

module.exports = function(app) {
  var queue = app.get('queue');

  return function(job, done) {
    var context = {};
    async.waterfall([
      function discoverApi(cb) {
        googleapis.discover('drive', 'v2').execute(cb);
      },
      function setup(client, cb) {
        this.client = client;
        this.authClient = app.get('googleOAuth');
        this.authClient.credentials = {
          access_token: "to_renew",
          refresh_token: job.data.providerToken
        };
        this.options = {
          maxResults: 1000,
          startChangeId: job.data.cursor,
          includeDeleted: (!! job.data.cursor)
        };
        cb(null, [], false);
      }.bind(context),
      function retrievePageOfChanges(changes, nextPage, cb) {
        if(nextPage) {
          this.options.pageToken = nextPage;
        }
        this.client.drive.changes
          .list(this.options)
          .withAuthClient(this.authClient)
          .execute(function mergePageOfChanges(err, res) {
            if(err || !res) {
              return cb(err, res);
            }

            changes = changes.concat(res.items);
            if(res.nextPageToken) {
              retrievePageOfChanges.apply(context, [changes, res.nextPageToken, cb]);
            } else {
              cb(null, changes);
            }
          }.bind(context));
      }.bind(context),
      function squashFiles(changes, cb) {
        this.lastChangeId = changes[changes.length -1].id;
        async.reduce(changes, {}, function reduceFile(files, change, cb) {
          files[PREFIX + change.file.id] = change.deleted?{deleted: true}:change.file;
          cb(null, files);
        }, cb);
      }.bind(context),
      function spawnUploadJobs(files, cb) {
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
        cb(null, this.lastChangeId);
      }.bind(context)
    ], done);
  };
};
