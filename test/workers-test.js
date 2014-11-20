'use strict';

require('should');
var sinon = require('sinon');

var workers = require('../lib/workers.js');

var spySendDocumentAndFile;

module.exports.addition = function(job, cb) {
  if(!spySendDocumentAndFile) {
    spySendDocumentAndFile = sinon.spy(job.anyfetchClient, "sendDocumentAndFile");
  }

  try {
    job.task.should.have.property('identifier');
    job.task.should.have.property('title');
    job.task.should.have.property('downloadUrl');
    job.task.should.have.property('type');
    job.task.should.have.property('createdDate');
    job.task.should.have.property('modifiedDate');
  } catch(e) {
    return cb(e);
  }

  workers.addition(job, function(err) {
    try {
      spySendDocumentAndFile.callCount.should.not.eql(0);
    } catch(e) {
      return cb(e);
    }

    cb(err);
  });
};

module.exports.deletion = workers.deletion;
