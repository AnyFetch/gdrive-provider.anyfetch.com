'use strict';

var should = require('should');
var config = require('../config/configuration.js');
var retrieve = require('../lib/provider-google-drive/helpers/retrieve.js');

describe("Retrieve files", function () {
  it("should list files when no id passed and return the id of the last document", function(done) {
    retrieve(config.test_refresh_token, null, config, function(err, files, lastId) {
      if(err) {
        done(err);
      }
      files.should.have.lengthOf(4);
      should.exist(files[0]);
      lastId.should.equal("49");
      files[0].should.have.property('id', '1wnEFyXM4bSaSqMORS0NycszCse9dJvhYoiZnITRMeCE');
      files[0].should.have.property('title', 'Test');
      files[0].should.have.property('mimeType', 'application/vnd.google-apps.document');
      done();
    });
  });
  it("should list files from a given id", function(done) {
    retrieve(config.test_refresh_token, "44", config, function(err, files, lastId) {
      if(err) {
        done(err);
      }
      files.length.should.equal(3);
      done();
    });
  });
});
