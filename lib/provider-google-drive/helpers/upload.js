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
 * Run the task of uploading a document to anyFetch.
 * This function will be used as a queue
 * @see https://github.com/caolan/async#queueworker-concurrency
 *
 * @param {Object} task Task param
 * @param {CluestrClient} cluestrClient The cluestr client
 * @param {String}
 * @param {Function} cb Callback once task has been processed.
 */
module.exports = function(task, cluestrClient, tokens, cb) {
  console.log(" ");
  console.log("====== " + task.id + " ======");
  if(task.deleted) {
    console.log("DELETE");
    // File has been removed
    return cluestrClient.deletedocument(task.id, cluestrClient, cb);
  }
  
  var fInfos = defineUrlFromFile(task);

  // Upload file onto Cluestr
  var document = {
    identifier: task.id,
    actions: {
      'show': task.alternateLink,
    },
    metadatas: {
      title: task.title,
      path: "@"
    },
    binary_document_type: fInfos.type,
    user_access: [cluestrClient.accessToken]
  };
  console.log("Requesting file: " + fInfos.title);
  console.log("Requesting url: " + fInfos.url);
  request(fInfos.url, function(err, res, body) {
    if(err) {
      return cb(err);
    }
    var fBuffer = new Buffer(body, 'binary');
    var fConfig = {
      file: fBuffer,
      filename: task.originalFilename || task.title,
      knownLength: fBuffer.length
    };
    console.log("CREATE/UPDATE");
    return cluestrClient.sendDocumentAndFile(document, fConfig, cb);
  });
  
  
};
