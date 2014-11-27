'use strict';

var log = require('anyfetch-provider').log;

var uploadFile = require('./helpers/upload.js');
var deleteFile = require('./helpers/delete.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  log.info({
    name: 'addition',
    identifier: job.task.identifier
  }, "Uploading");
  uploadFile(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  log.info({
    name: 'deletion',
    identifier: job.task.identifier
  }, "Deleting");
  deleteFile(job.task, job.anyfetchClient, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  });
};
