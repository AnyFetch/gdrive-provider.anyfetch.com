"use strict";

module.exports = function(file) {
  if(file.exportLinks) { // this file is a google drive document
    /* if(file.exports["text/html"]) {
      return {
        type: "document",
        url: file.exports["text/html"],
        extension: ".html"
      };
    } */
    // we hide html export unless we are able to hydrate zips
    if(file.exports["application/pdf"]) {
      return {
        type: "file",
        url: file.exports["application/pdf"],
        extension: ".pdf"
      };
    } else if(file.exports["text/plain"]) {
      return {
        type: "document",
        url: file.exports["text/plain"],
        extension: ".txt"
      };
    }
  }

  return {
    type: "file",
    url: file.downloadUrl,
    extension: ""
  };
};
