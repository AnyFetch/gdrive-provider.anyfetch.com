"use strict";

require('should');
var async = require('async');

require('../mock/index.js');
var del = require('../../jobs/delete.js');
var app = require('../../app.js');

describe("Job delete", function() {
  it('should succeed to delete a document in anyfetch', function(done) {
    var id = 'http://gdrive.provider.anyfetch.com/file0';
    var job = {
      data: {
        title: "Delete " + id,
        anyfetchToken: 'anAccessToken',
        id: id
      }
    };

    async.waterfall([
      function startJob(cb) {
        del(app)(job, cb);
      }
    ], done);
  });
});
