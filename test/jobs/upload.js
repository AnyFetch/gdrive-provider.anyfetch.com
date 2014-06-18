"use strict";

require('should');
var async = require('async');

require('../mock/index.js');
var upload = require('../../jobs/update.js');
var app = require('../../app.js');

describe("Job upload", function() {
  it('should succeed to upload a new document to anyfetch', function(done) {
    var job = {
      data: {

      }
    };

    async.waterfall([
      function startJob(cb) {
        upload(app)(job, cb);
      },
      function assertJobResult(changeId, cb) {
        cb();
      }
    ], done);
  });
});
