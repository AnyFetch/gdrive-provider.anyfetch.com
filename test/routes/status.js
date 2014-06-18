"use strict";

var async = require('async');
var request = require('supertest');
var clean = require('../helpers/clean.js');
var app = require('../../app.js');

describe("GET /status", function() {
  before(function bindStore() {
    this.store = app.get('keyValueStore');
  });
  beforeEach(clean);
  beforeEach(function populateHashs(done) {
    async.series([
      function addCursor(cb) {
        this.store.hset('cursors', 'tok', 'testCursor', cb);
      }.bind(this),
      function addStatus(cb) {
        this.store.hset('status', 'tok', 'testStatus', cb);
      }.bind(this),
      function addLastUpdate(cb) {
        this.store.hset('lastUpdates', 'tok', 'testLastUpdate', cb);
      }.bind(this)
    ], done);
  });

  it('should get the cursor, status & lastUpdate keys', function(done) {
    async.waterfall([
      function reset(cb) {
        request(app)
          .get('/status')
          .query({ access_token: 'tok' })
          .expect(200)
          .end(cb);
      },
      function assertResponse(res, cb) {
        res.body.should.have.property('anyfetch_token', 'tok');
        res.body.should.have.property('cursor', 'testCursor');
        res.body.should.have.property('is_updating', 'testStatus');
        res.body.should.have.property('last_update', 'testLastUpdate');
        cb();
      }
    ], done);
  });

});
