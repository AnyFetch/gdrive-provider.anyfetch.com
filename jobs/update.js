"use strict";

var async = require('async');
var gApis = require('googleapis');
var retrieveAllChanges = require('../helpers/retrieve-all-changes.js');
var subjob = require('../helpers/subjob.js');
var selectBestDownload = require('../helpers/select-best-download.js');

var PREFIX = "http://gdrive.provider.anyfetch.com/";

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
        retrieveAllChanges(options, client, authClient, cb);
      },
      function spawnUploadJobs(changes, cb) {
        var lastChangeId = null;
        changes.forEach(function(change) {
          var file = change.file;
          var id = PREFIX + file.id;
          lastChangeId = change.id;
          if(file.deleted || (job.data.cursor && file.labels.trashed)) {
            subjob.create(queue, 'deletion', {
              title: "Delete " + id,
              anyfetchToken: job.data.anyfetchToken,
              id: id
            });
          } else {
            var download = selectBestDownload(file);
            if(download.url && !file.labels.trashed && file.fileSize < app.get('maxSize') * 1024 * 1024) {
              subjob.create(queue, 'upload', {
                title: file.title + download.extension,
                anyfetchToken: job.data.anyfetchToken,
                providerToken: job.data.providerToken,
                downloadUrl: download.url,
                showAction: file.alternateLink,
                type: download.type,
                id: id
              });
            }
          }
        });
        cb(null, lastChangeId);
      }
    ], done);
  };
};
