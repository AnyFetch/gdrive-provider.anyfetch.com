'use strict';

var request = require('request');

var defineUrlFromFile = function(file) {
  if(file.exportLinks) { // Gdocs ! Yay !
    console.log("Google docs type");
    var el = file.exportLinks;
    if(el["text/html"]) {
      return {
        url: el["text/html"],
        type: "document"
      };
    } else if(el["application/pdf"]) {
      return {
        url: el["application/pdf"],
        type: "file"
      }
    } else if(el["text/plain"]) {
      return {
        url: el["text/plain"],
        type: "document"
      };
    }
  }
  console.log("Standard file");
  return {
    url: file.downloadUrl,
    type: "file"
  }
};

/**
 * Run the task of uploading a document to anyfetch.
 * This function will be used as a queue
 * @see https://github.com/caolan/async#queueworker-concurrency
 *
 * @param {Object} task Task param
 * @param {AnyFetchClient} anyfetchClient The anyfetch client
 * @param {String}
 * @param {Function} cb Callback once task has been processed.
 */
module.exports = function(task, anyfetchClient, authToken, cb) {
  console.log(" ");
  console.log("====== " + task.id + " ======");
  if(task.deleted) {
    console.log("DELETE");
    // File has been removed
    return anyfetchClient.deletedocument(task.id, anyfetchClient, cb);
  }
  
  var fInfos = defineUrlFromFile(task);

  // Upload file onto AnyFetch
  var document = {
    identifier: task.id,
    actions: {
      'show': task.alternateLink,
    },
    metadatas: {
      title: task.title,
      path: "@"
    },
    document_type: fInfos.type,
    user_access: [anyfetchClient.accessToken]
  };
  console.log("Requesting file: " + document.metadatas.title);
  console.log("Requesting url: " + fInfos.url);
  var opts = {
    url: fInfos.url,
    headers: {
      'Authorization': authToken.tokenType + ' ' + authToken.access_token
    },
    encoding: null
  };
  request(opts, function(err, res, body) {
    if(err) {
      return cb(err);
    }
    console.log(body);
    var fBuffer = new Buffer(body, 'binary');
    var fConfig = {
      file: fBuffer,
      filename: task.originalFilename || task.title,
      knownLength: fBuffer.length
    };
    console.log("CREATE/UPDATE");
    return anyfetchClient.sendDocumentAndFile(document, fConfig, cb);
  });
  
  
};
