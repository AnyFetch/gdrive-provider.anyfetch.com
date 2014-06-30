"use strict";

var debug = require('debug');
var subjob = require('./subjob.js');
var selectBestDownload = require('../helpers/select-best-download.js');

var PREFIX = "https://docs.google.com/file/d/";

module.exports = function (job, app) {
  var queue = app.get('queue');

  return function spawnUploadJobs(changes) {
    changes.forEach(function(change) {
      var id = PREFIX + change.fileId;
      if(change.deleted || (job.data.cursor && change.file.labels.trashed)) {
        subjob.create(queue, 'delete', {
          title: "Delete " + id,
          anyfetchToken: job.data.anyfetchToken,
          id: id
        });
      } else {
        var file = change.file;
        debug('info:gdrive')('analyzing file ', file.title);
        var download = selectBestDownload(file);
        if(download.url && !file.labels.trashed && file.fileSize < app.get('maxSize') * 1024 * 1024) {
          subjob.create(queue, 'upload', {
            title: file.title + download.extension,
            anyfetchToken: job.data.anyfetchToken,
            providerToken: job.data.providerToken,
            downloadUrl: download.url,
            type: download.type,
            date: file.createdDate,
            id: id
          });
        }
      }
    });
  };
};
