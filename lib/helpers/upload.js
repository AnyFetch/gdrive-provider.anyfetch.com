'use strict';

var request = require('request');
var config = require('../../config/configuration.js');

var ONLY_PDF = true;

var getFileInfo = function(file) {
  if(file.exportLinks) { // Gdocs ! Yay !
    console.log("Google docs type");
    var el = file.exportLinks;
    if(el["text/html"] && !ONLY_PDF) {
      return {
        url: el["text/html"],
        type: "document"
      };
    } else if(el["application/pdf"]) {
      return {
        url: el["application/pdf"],
        type: "file"
      };
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
  };
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
    return anyfetchClient.deleteDocument(task.id, anyfetchClient, cb);
  }

  var fInfos = getFileInfo(task);

  var isHTML = false;

  // Upload file onto AnyFetch
  var pathExt = "";
  if(task.exportLinks) {
    if(task.exportLinks["text/html"] && !ONLY_PDF) {
      pathExt = ".html";
      isHTML = true;
    } else {
      pathExt = ".pdf";
    }
  }

  var document = {
    identifier: task.id,
    actions: {
      'show': task.alternateLink,
    },
    metadatas: {
      title: task.title,
      path: "/" + task.id + "/" + task.title + pathExt,
    },
    document_type: fInfos.type,
    user_access: [anyfetchClient.accessToken]
  };
  console.log("Requesting file: " + document.metadatas.title);
  console.log("Requesting url: " + fInfos.url);
  var opts = {
    url: fInfos.url,
    headers: {
      'Authorization': task.authTokens.token_type + ' ' + task.authTokens.access_token
    },
    encoding: null
  };
  if(opts.url !== undefined) {
    if(task.fileSize) {
      if(task.fileSize > config.max_size * 1024 * 1024) {
        console.log("File too large, skipping ... ", task.fileSize);
        return cb();
      }
    }

    request(opts, function(err, res, body) {
      if(err) {
        return cb(err);
      }

      var fBuffer = new Buffer(body, 'binary');
      var fConfig = {
        file: isHTML ? fBuffer.toString() : fBuffer,
        filename: task.originalFilename || task.title,
        knownLength: fBuffer.length
      };
      console.log("Size: " + fBuffer.length);
      console.log("CREATE/UPDATE");
      anyfetchClient.sendDocumentAndFile(document, fConfig, function(err) {
        if(err) {
          console.log(err);
          return cb(err);
        }
        return cb();
      });
    });
  } else {
    console.log("Folder: SKIP");
    return cb();
  }
};
