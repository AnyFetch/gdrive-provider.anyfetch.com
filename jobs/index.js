"use strict";

var autoload = require('auto-load');
var kue = require('kue');
var async = require('async');
var rarity = require('rarity');
var debug = require('debug')('kue:boot');
var jobs = autoload(__dirname);

module.exports = function(app) {
  var queue = app.get('queue');
  var store = app.get('keyValueStore');

  delete jobs.index;
  for(var job in jobs) {
    debug('wait for job type', job);
    // create new job processor
    queue.process(job, app.get('concurrency'), jobs[job](app));
  }

  queue.on('job complete', function(id, result) {
    async.waterfall([
      function getJob(cb) {
        kue.Job.get(id, cb);
      },
      function removeJob(job, cb) {
        var anyfetchToken = job.data.anyfetchToken;
        job.remove(rarity.carry([anyfetchToken], cb));
      },
      function setCursor(anyfetchToken, cb) {
        if(!anyfetchToken) {
          return cb(null, null, null);
        }
        store.hset('cursor', anyfetchToken, result, rarity.carry([anyfetchToken], cb));
      },
      function setLastUpdate(anyfetchToken, status, cb) {
        if(!anyfetchToken) {
          return cb(null, null, null);
        }
        store.hset('lastUpdate', anyfetchToken, Date.now().toString(), rarity.carry([anyfetchToken], cb));
      },
      function unlockUpdate(anyfetchToken, status, cb) {
        if(!anyfetchToken) {
          return cb(null, null, null);
        }
        store.hdel('status', anyfetchToken, cb);
      }
    ], function throwErrs(err) {
      if(err) {
        throw err;
      }
    });
  });
};
