"use strict";

var async = require('async');

module.exports.del = function(req, res, next) {
  var store = req.app.get('keyValueStore');
  async.parallel([
    function delCursor(cb) {
      store.hdel('cursors', req.query.access_token, cb);
    },
    function delStatus(cb) {
      store.hdel('status', req.query.access_token, cb);
    },
    function delLastUpdates(cb) {
      store.hdel('lastUpdates', req.query.access_token, cb);
    },
    function response(cb) {
      res.send(204);
      cb();
    }
  ], next);
};
