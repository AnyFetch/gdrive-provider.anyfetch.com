'use strict';

var url = require('url');
var https = require('https');

/**
 * Upload file onto AnyFetch.
 *
 *
 * @param {Object} task Data of the task
 * @param {Object} anyfetchClient Client for upload
 * @param {Object} accessToken Access token of the current account
 * @param {Function} cb Callback to call once file has been uploaded.
 */
module.exports = function(task, anyfetchClient, accessToken, finalCb) {
  var fileConfig = function(cb) {
    var options = url.parse(task.downloadUrl);
    options.headers = {
      'Authorization': 'Bearer ' + accessToken
    };

    var req = https.request(options, function(res) {
      cb({ file: res, filename: task.title });
    });
        
    req.on('error', finalCb);
    req.end();
  };
          
  var document = {
    identifier: task.id,
    actions: {
      show: task.id
    },
    creation_date: task.date,
    metadata: {
      title: task.title,
      path: '/' + task.title,
      starred: task.starred
    },
    document_type: task.type,
    user_access: [anyfetchClient.accessToken]
  };

  anyfetchClient.sendDocumentAndFile(document, fileConfig, finalCb);
};
