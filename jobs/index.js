"use strict";

var autoload = require('auto-load');
var kue = require('kue');
var async = require('async');
var rarity = require('rarity');
var debug = require('debug')('kue:boot');
var processors = autoload(__dirname);

module.exports = function(app) {
  var queue = app.get('queue');
  var store = app.get('keyValueStore');

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

  queue.on('job complete', function(id, result) {
    async.waterfall([
      function getJob(cb) {
        kue.Job.get(id, cb);
      },
      function removeJob(job, cb) {
        var anyfetchToken = job.data.anyfetchToken;
        job.remove(rarity.carry([anyfetchToken, job], cb));
      },
      function setCursor(id, anyfetchToken, job, cb) {
        console.log(id, anyfetchToken, job, cb);
        if(job.type === 'update') {
          async.waterfall([
            function setCursor(cb) {
              store.hset('cursor', anyfetchToken, result, cb);
            },
            function setLastUpdate(status, cb) {
              store.hset('lastUpdate', anyfetchToken, Date.now().toString(), cb);
            },
            function unlockUpdate(status, cb) {
              store.hdel('status', anyfetchToken, cb);
            }
          ], cb);
        } else {
          cb();
        }
      },
    ], function throwErrs(err) {
      if(err) {
        throw err;
      }
    });
  });
};
