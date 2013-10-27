'use strict';

/**
 * Run the task of uploading a document to anyFetch.
 * This function will be used as a queue
 * @see https://github.com/caolan/async#queueworker-concurrency
 *
 * @param {Object} task Task param
 * @param {Function} cb Callback once task has been processed.
 */
module.exports = function(task, cluestrClient, tokens, cb) {
  var throwCb = function(err) {
    if(err) {
      throw err;
    }
    cb();
  };

  var path = task[0];
  var file = task[1];

  if(file.deleted) {
    // File has been removed
    return deleteFile(file.id, cluestrClient, throwCb);
  }
  else {
    // Upload file onto Cluestr
    return uploadFile(file.id, file, tokens, cluestrClient, throwCb);
  }
};