"use strict";

require('should');
var async = require('async');

require('../mock/index.js');
var upload = require('../../jobs/upload.js');
var app = require('../../app.js');

describe("Job upload", function() {
  it('should succeed to upload a new document to anyfetch', function(done) {
    var job = {
      data: {
        providerToken: "aGoogleRefreshToken",
        downloadUrl: "https://googleusercontent.com/gdoc.pdf",
        type: 'document',
        title: 'Awesome document.pdf',
        id: 'https://docs.google.com/file/d/file0',
        anyfetchToken: 'anAccessToken',
        date: "somedate"
      }
    };

    async.waterfall([
      function startJob(cb) {
        upload(app)(job, cb);
      }
    ], done);
  });
});
