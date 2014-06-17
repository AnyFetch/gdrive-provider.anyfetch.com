"use strict";

var should = require('should');
var async = require('async');

require('../mock/index.js');
var update = require('../../jobs/update.js');
var clean = require('../helpers/clean.js');
var app = require('../../app.js');

describe("Job update", function() {
  before(function bindStore() {
    this.store = app.get('keyValueStore');
  });
  beforeEach(clean);

  it('should succeed and fetch the change id', function(done) {
    var job = {
      data: {
        title: "A test update",
        providerToken: 'aGoogleRefreshToken',
        cursor: null,
        anyfetchToken: 'anAccessToken'
      }
    };

    async.waterfall([
      function startJob(cb) {
        update(app)(job, cb);
      },
      function assertJobResult(changeId, cb) {
        changeId.should.be.exactly('change0');
        cb();
      }
    ], done);
  });

  it('should be able to resume from the right change id', function(done) {
    var job = {
      data: {
        title: "A test update",
        providerToken: 'aGoogleRefreshToken',
        cursor: 'change0',
        anyfetchToken: 'anAccessToken'
      }
    };

    async.waterfall([
      function startJob(cb) {
        update(app)(job, cb);
      },
      function assertJobResult(changeId, cb) {
        changeId.should.be.exactly('change1');
        cb();
      }
    ], done);
  });
});
