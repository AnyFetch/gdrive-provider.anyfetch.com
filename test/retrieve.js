'use strict';

var should = require('should');
var config = require('../config/configuration.js');
var retrieve = require('../lib/helpers/retrieve.js');

describe("Retrieve files", function () {
  it("should list files when no id passed and return the id of the last document", function(done) {
    retrieve(config.test_refresh_token, null, config, function(err, files, lastId) {
      if(err) {
        throw err;
      }
      files.should.have.lengthOf(4);
      should.exist(files[0]);
      lastId.should.be.ok;
      files[0].should.have.property('id', '0B7aLaQagdH0eemtCLXJvcHk2anc');
      files[0].should.have.property('title', 'valorisation - Copie.jpg');
      files[0].should.have.property('mimeType', 'image/jpeg');
      done();
    });
  });

  it("should list files from a given id", function(done) {
    retrieve(config.test_refresh_token, "44", config, function(err, files, lastId) {
      if(err) {
        throw err;
      }
      files.length.should.equal(4);
      done();
    });
  });
});
