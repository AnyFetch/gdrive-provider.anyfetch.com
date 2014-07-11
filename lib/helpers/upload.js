'use strict';

var stream = require('stream');
var request = require('superagent');

/**
 * Upload file onto AnyFetch.
 *
 *
 * @param {Object} task Data of the task
 * @param {Object} anyfetchClient Client for upload
 * @param {Object} accessToken Access token of the current account
 * @param {Function} cb Callback to call once file has been uploaded.
 */
module.exports = function(task, anyfetchClient, accessToken, cb) {
  var req = request(task.downloadUrl).set('Authorization', 'Bearer ' + accessToken);

  var fileConfig = function() {
    return {
      file: req.pipe(new stream.PassThrough()),
      filename: task.title
    };
  };
      
  var document = {
    identifier: task.id,
    actions: {
      show: task.id
    },
    creation_date: task.date,
    metadata: {
      title: task.title,
      path: '/' + task.title
    },
    document_type: task.type,
    user_access: [anyfetchClient.accessToken]
  };

  anyfetchClient.sendDocumentAndFile(document, fileConfig, cb);
};
