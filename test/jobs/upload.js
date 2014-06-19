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
        id: 'http://gdrive.provider.anyfetch.com/file0',
        anyfetchToken: 'anAccessToken',
        showAction: 'http://downloads/show/gdoc',
      }
    };

    async.waterfall([
      function startJob(cb) {
        upload(app)(job, cb);
      }
    ], done);
  });
});
