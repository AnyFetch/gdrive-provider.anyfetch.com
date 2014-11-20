'use strict';

var uploadFile = require('./helpers/upload.js');
var deleteFile = require('./helpers/delete.js');

module.exports.addition = function additionQueueWorker(job, cb) {
  console.log("Uploading", job.task.title);
  uploadFile(job.task, job.anyfetchClient, job.serviceData.tokens.access_token, cb);
};

module.exports.deletion = function deletionQueueWorker(job, cb) {
  console.log("Deleting", job.task.title);
  deleteFile(job.task, job.anyfetchClient, function(err) {
    if(err && err.toString().match(/expected 204 "No Content", got 404 "Not Found"/i)) {
      err = null;
    }

    cb(err);
  });
};
