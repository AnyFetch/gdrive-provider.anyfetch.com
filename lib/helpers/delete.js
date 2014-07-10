'use strict';

/**
 * Delete file onto AnyFetch.
 *
 *
 * @param {Object} task Data of the task
 * @param {Object} anyfetchClient Client for delete
 * @param {Object} accessToken Access token of the current account
 * @param {Function} cb Callback to call once file has been deleted.
 */
module.exports = function(task, anyfetchClient, accessToken, cb) {
  anyfetchClient.deleteDocument(task.id, cb);
};
