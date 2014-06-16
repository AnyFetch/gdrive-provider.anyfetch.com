"use_strict";

require('should');
var request = require('supertest');
var async = require('async');
var url = require('url');
var app = require('../../../app.js');

describe("GET /init/connect", function() {
  it('should redirect the user to the google authorization page', function(done) {
    async.waterfall([
      function queryConnect(cb) {
        request(app)
          .get('/init/connect')
          .query({ code: "aCode" })
          .expect(320)
          .end(cb);
      },
      function assertRedirection(res, cb) {
        var components = url.parse(res.headers.location, true);
        var accServ = url.parse(app.get('gdrive.accountServer'));
        components.should.have.property('protocol', accServ.protocol);
        components.should.have.property('host', accServ.host);
        components.should.have.property('pathname', '/o/oauth2/auth');
        components.query.should.have.property('client_id', 'aClientId');
        components.query.should.have.property('redirect_uri', app.get('gdrive.redirectUri') + '?code=aCode');
        components.query.should.have.property('scope', 'https://www.googleapis.com/auth/drive.readonly');
        components.query.should.have.property('access_type', 'offline');
        components.query.should.have.property('approval_prompt', 'force');
      }
    ], done);
  });
});
