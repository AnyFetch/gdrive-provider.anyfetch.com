'use strict';

var request = require('supertest');
var AnyFetchProvider = require('anyfetch-provider');
var Anyfetch = require('anyfetch');
var sinon = require('sinon');
require('should');

var config = require('../config/configuration.js');
var serverConfig = require('../lib/');

describe("Workflow", function () {
  before(AnyFetchProvider.debug.cleanTokens);

  // Create a fake HTTP server
  Anyfetch.setApiUrl('http://localhost:1337');
  var apiServer = Anyfetch.createMockServer();
  apiServer.listen(1337);

  before(function(done) {
    AnyFetchProvider.debug.createToken({
      anyfetchToken: 'fake_gc_access_token',
      data: {
        callbackUrl: config.providerUrl + "/init/callback",
        tokens: {
          refresh_token: config.testRefreshToken
        }
      },
      accountName: 'account_name',
      cursor: '66'
    }, done);
  });

  it("should upload data to AnyFetch", function(done) {
    var originalQueueWorker = serverConfig.workers.addition;
    var spySendDocumentAndFile;

    serverConfig.workers.addition = function(job, cb) {
      if(!job.anyfetchClient.sendDocumentAndFile.id) {
        spySendDocumentAndFile = sinon.spy(job.anyfetchClient, "sendDocumentAndFile");
      }

      job.task.should.have.property('identifier');
      job.task.should.have.property('title');
      job.task.should.have.property('downloadUrl');
      job.task.should.have.property('type');
      job.task.should.have.property('createdDate');
      job.task.should.have.property('modifiedDate');

      originalQueueWorker(job, cb);
    };
    var server = AnyFetchProvider.createServer(serverConfig.connectFunctions, serverConfig.updateAccount, serverConfig.workers, serverConfig.config);

    request(server)
      .post('/update')
      .send({
        access_token: 'fake_gc_access_token',
        api_url: 'http://localhost:1337',
        documents_per_update: 2500
      })
      .expect(202)
      .end(function(err) {
        if(err) {
          throw err;
        }
      });

    server.usersQueue.once('empty', function() {
      spySendDocumentAndFile.callCount.should.not.eql(0);
      done();
    });
  });
});
