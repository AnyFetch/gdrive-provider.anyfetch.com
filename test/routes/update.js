"use strict";

"use strict";

var kue = require('kue');
var async = require('async');
var request = require('supertest');
var app = require('../../app.js');

describe("POST /update", function() {
  beforeEach(function eraseAndPopulateHashs(done) {
    this.store = app.get('keyValueStore');
    async.series([
      function delTokens(cb) {
        this.store.del('tokens', cb);
      }.bind(this),
      function delCursors(cb) {
        this.store.del('cursors', cb);
      }.bind(this),
      function delStatus(cb) {
        this.store.del('status', cb);
      }.bind(this),
      function delLastUpdates(cb) {
        this.store.del('lastUpdates', cb);
      }.bind(this)
    ], done);
  });

  it('should not update if the provider token is not set', function(done) {
    request(app)
      .post('/update')
      .query({ access_token: 'tok' })
      .expect(500)
      .expect(/not initialized/)
      .end(done);
  });

  it('should update if the provider token not set', function(done) {
    async.waterfall([
      function addProviderToken(cb) {
        this.store.hset('tokens', 'tok', 'toktok', cb);
      }.bind(this),
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .query({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      }
    ], done);
  });

  it('should not let update the provider if it is alredy updating', function(done) {
    async.waterfall([
      function addProviderToken(cb) {
        this.store.hset('tokens', 'tok', 'toktok', cb);
      }.bind(this),
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .query({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      },
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .query({ access_token: 'tok' })
          .expect(500)
          .expect(/already processing/)
          .end(cb);
      }
    ], done);
  });
});
