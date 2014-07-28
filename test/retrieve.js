'use strict';

var async = require('async');
var googleapis = require('googleapis');
var rarity = require('rarity');
var config = require('../config/configuration.js');
var retrieve = require('../lib/helpers/retrieve.js');

describe("Retrieve code", function () {
  it("should list files", function (done) {
    async.waterfall([
      function refreshToken(cb) {
        var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, config.providerUrl + "/init/callback");
        oauth2Client.refreshToken_(config.testRefreshToken, rarity.carryAndSlice([oauth2Client], 3, cb));
      },
      function callRetrieve(oauth2Client, tokens, cb) {
        var options = {
          maxResults: 1000,
          includeDeleted: false
        };
        
        oauth2Client.credentials = tokens;
        options.auth = oauth2Client;

        retrieve(options, [], cb);
      },
      function checkChanges(newCursor, changes, cb) {
        changes.should.have.lengthOf(4);
        cb(null);
      }
    ], done);
  });

  it("should list contacts modified after specified date", function (done) {
    async.waterfall([
      function refreshToken(cb) {
        var oauth2Client = new googleapis.auth.OAuth2(config.googleId, config.googleSecret, config.providerUrl + "/init/callback");
        oauth2Client.refreshToken_(config.testRefreshToken, rarity.carryAndSlice([oauth2Client], 3, cb));
      },
      function callRetrieve(oauth2Client, tokens, cb) {
        var options = {
          maxResults: 1000,
          includeDeleted: true,
          startChangeId: '66'
        };

        oauth2Client.credentials = tokens;
        options.auth = oauth2Client;

        retrieve(options, [], cb);
      },
      function checkChanges(newCursor, changes, cb) {
        changes.should.have.lengthOf(1);
        cb(null);
      }
    ], done);
  });
});
