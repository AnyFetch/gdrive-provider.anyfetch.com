"use strict";

/*
 * application/vnd.google-apps.document
 * application/vnd.google-apps.presentation
 * application/vnd.google-apps.drawing
 * application/vnd.google-apps.spreadsheet
 */

module.exports = function(file) {
  if(file.exportLinks) { // this file is a google drive document
    if(file.exportLinks["application/pdf"]) {
      return {
        type: "file",
        url: file.exportLinks["application/pdf"],
        extension: ".pdf"
      };
    }
  }

  return {
    type: "file",
    url: file.downloadUrl,
    extension: ""
  };
};