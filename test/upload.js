'use strict';

var request = require('supertest');
var AnyFetchProvider = require('anyfetch-provider');
require('should');

var config = require('../config/configuration.js');
var serverConfig = require('../lib/provider-google-drive')(config);

describe("File Upload", function () {
  // Create a fake HTTP server
  process.env.ANYFETCH_API_URL = 'http://localhost:1337';

  // Create a fake HTTP server
  var frontServer = AnyFetchProvider.debug.createTestApiServer();
  frontServer.listen(1337);

  before(AnyFetchProvider.debug.cleanTokens);
  before(function(done) {
    AnyFetchProvider.debug.createToken({
      anyfetchToken: 'fake_gdrive_access_token',
      datas: config.test_refresh_token,
      cursor: process.test_cursor
    }, done);
  });

  it("should upload datas to AnyFetch", function (done) {
    var count = 0;
    var originalQueueWorker = serverConfig.queueWorker;
    serverConfig.queueWorker = function(task, anyfetchClient, gdriveTokens, cb) {
      try {
        task.should.have.property('id');
      } catch(e) {
        return done(e);
      }
      originalQueueWorker(task, anyfetchClient, gdriveTokens, function (err) {
        if(err) {
          console.log(err);
          return cb(err);
        }
        count += 1;
        if(count === 4) {
          done();
        }
        cb();
      });
    };
    var server = AnyFetchProvider.createServer(serverConfig);

    request(server)
      .post('/update')
      .send({
        access_token: 'fake_gdrive_access_token'
      })
      .expect(202)
      .end(function(err) {
        if(err) {
          throw err;
        }
      });
  });
});