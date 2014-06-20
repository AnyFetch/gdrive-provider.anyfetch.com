"use strict";

var async = require('async');
var request = require('supertest');
var clean = require('../helpers/clean.js');
var app = require('../../app.js');

describe("POST /update", function() {
  before(function bindStore() {
    this.store = app.get('keyValueStore');
  });
  beforeEach(clean);

  it('should not update if the provider token is not set', function(done) {
    request(app)
      .post('/update')
      .send({ access_token: 'tok' })
      .expect(404)
      .expect(/token not initialized/i)
      .end(done);
  });

  it('should update if the provider token is set', function(done) {
    async.waterfall([
      function addProviderToken(cb) {
        this.store.hset('tokens', 'tok', 'toktok', cb);
      }.bind(this),
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .send({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      }
    ], done);
  });

  it('should not let update the provider if it is already updating', function(done) {
    async.waterfall([
      function addProviderToken(cb) {
        this.store.hset('tokens', 'tok', 'toktok', cb);
      }.bind(this),
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .send({ access_token: 'tok' })
          .expect(204)
          .end(cb);
      },
      function requestUpdate(status, cb) {
        request(app)
          .post('/update')
          .send({ access_token: 'tok' })
          .expect(429)
          .expect(/already processing/i)
          .end(cb);
      }
    ], done);
  });
});
