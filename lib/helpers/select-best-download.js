"use strict";

module.exports = function(file) {
  if(file.exportLinks) { // this file is a google drive document
    /* if(file.exportLinks["text/html"]) {
      return {
        type: "document",
        url: file.exportLinks["text/html"],
        extension: ".html"
      };
    } */
    // we hide html export unless we are able to hydrate zips
    if(file.exportLinks["application/pdf"]) {
      return {
        type: "file",
        url: file.exportLinks["application/pdf"],
        extension: ".pdf"
      };
    } else if(file.exportLinks["text/plain"]) {
      return {
        type: "document",
        url: file.exportLinks["text/plain"],
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