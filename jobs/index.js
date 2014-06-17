"use strict";

var autoload = require('auto-load');
var kue = require('kue');
var async = require('async');
var jobs = autoload(__dirname);

module.exports = function(app) {
  var queue = app.get('queue');
  var store = app.get('keyValueStore');

  for(var job in jobs) {
    queue.process(job, jobs[job]);
  }

  queue.on('job complete', function(id, result) {
    var afToken;
    async.waterfall([
      function getJob(cb) {
        kue.Job.get(id, cb);
      },
      function setCursor(job, cb) {
        afToken = job.anyfetchToken;

        store.hset('cursor', afToken, result, cb);
      },
      function setLastUpdate(status, cb) {
        store.hset('lastUpdate', afToken, Date.now().toString(), cb);
      },
      function unlockUpdate(status, cb) {
        store.hdel('status', afToken, cb);
      }
    ], function throwErrs(err) {
      if(err) {
        throw err;
      }
    });
  });
};
