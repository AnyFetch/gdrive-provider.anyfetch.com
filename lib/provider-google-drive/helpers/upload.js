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

  if(task.deleted) {
    // File has been removed
    return cluestrClient.deletedocument(task.id, cluestrClient, throwCb);
  }

  // Upload file onto Cluestr
  var document = {
    identifier: task.id,
    actions: {
      'show': task.alternateLink,
    }
  };
  return cluestrClient.sendDocumentAndFile(task.id, document, throwCb);
};
