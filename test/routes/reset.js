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
        this.store.hset('cursors', 'tok', 'test', cb);
      }.bind(this),
      function delStatus(cb) {
        this.store.del('status', cb);
      }.bind(this),
      function addStatus(cb) {
        this.store.hset('status', 'tok', 'test', cb);
      }.bind(this),
      function delLastUpdates(cb) {
        this.store.del('lastUpdates', cb);
      }.bind(this),
      function addLastUpdate(cb) {
        this.store.hset('lastUpdates', 'tok', 'test', cb);
      }.bind(this)
    ], done);
  });

  it('should delete the cursor', function(done) {
    async.waterfall([
      function reset(cb) {
        request(app)
          .del('/reset')
          .query({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      },
      function queryRedis(res, cb) {
        this.store.hget('cursors', 'tok', cb);
      }.bind(this),
      function assertResponse(res, cb) {
        should(res).be.exactly(null);
        cb();
      }
    ], done);
  });

  it('should delete the status', function(done) {
    async.waterfall([
      function reset(cb) {
        request(app)
          .del('/reset')
          .query({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      },
      function queryRedis(res, cb) {
        this.store.hget('status', 'tok', cb);
      }.bind(this),
      function assertResponse(res, cb) {
        should(res).be.exactly(null);
        cb();
      }
    ], done);
  });

  it('should delete the lastUpdate', function(done) {
    async.waterfall([
      function reset(cb) {
        request(app)
          .del('/reset')
          .query({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      },
      function queryRedis(res, cb) {
        this.store.hget('lastUpdates', 'tok', cb);
      }.bind(this),
      function assertResponse(res, cb) {
        should(res).be.exactly(null);
        cb();
      }
    ], done);
  });
});
