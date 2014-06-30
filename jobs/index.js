"use strict";

var autoload = require('auto-load');
var kue = require('kue');
var async = require('async');
var rarity = require('rarity');
var debug = require('debug')('kue:boot');
var processors = autoload(__dirname);

module.exports = function(app) {
  var queue = app.get('queue');

  delete processors.index;
  for(var processor in processors) {
    debug('wait for job type', processor);
    // create new job processor
    queue.process(processor, app.get('concurrency'), processors[processor](app));
  }


  process.once('SIGTERM', function() {
    queue.shutdown(function() {
      process.exit(0);
    }, 5000 );
  });

  queue.on('job complete', function(id) {
    async.waterfall([
      function getJob(cb) {
        kue.Job.get(id, cb);
      },
      function removeJob(job, cb) {
        job.remove(rarity.carry([job], cb));
      }
    ], function throwErrs(err) {
      if(err) {
        throw err;
      }
    });
  });

  // Restart cutted jobs
  kue.Job.rangeByType ('job', 'active', 0, 100, 'asc', function (err, selectedJobs) {
    selectedJobs.forEach(function (job) {
        job.state('inactive').save();
    });
});
};
