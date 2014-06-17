"use strict";

var should = require('should');
var async = require('async');
var request = require('supertest');
var app = require('../../app.js');

describe("DELETE /reset", function() {
  beforeEach(function eraseAndPopulateHashs(done) {
    this.store = app.get('keyValueStore');
    async.series([
      function delCursors(cb) {
        this.store.del('cursors', cb);
      }.bind(this),
      function addCursor(cb) {
        this.store.hset('cursors', 'tok', 'testCursor', cb);
      }.bind(this),
      function delStatus(cb) {
        this.store.del('status', cb);
      }.bind(this),
      function addStatus(cb) {
        this.store.hset('status', 'tok', 'testStatus', cb);
      }.bind(this),
      function delLastUpdates(cb) {
        this.store.del('lastUpdates', cb);
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
