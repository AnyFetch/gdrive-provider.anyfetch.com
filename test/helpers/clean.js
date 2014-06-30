"use strict";

var async = require('async');
var app = require('../../app.js');

module.exports = function(done) {
  var store = app.get('keyValueStore');
  async.series([
    function delCursors(cb) {
      store.del('cursor', cb);
    },
    function delStatus(cb) {
      store.del('status', cb);
    },
    function delLastUpdates(cb) {
      store.del('lastUpdates', cb);
    },
    function addLastUpdate(cb) {
      store.hset('lastUpdates', 'tok', 'test', cb);
    }
  ], done);
};
