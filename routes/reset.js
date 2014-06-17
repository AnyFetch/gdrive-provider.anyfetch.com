"use strict";

var async = require('async');

module.exports.del = function(req, res, next) {
  var store = req.app.get('keyValueStore');
  async.waterfall([
    function delCursor(cb) {
      store.hdel('cursors', req.query.access_token, cb);
    },
    function delStatus(status, cb) {
      store.hdel('status', req.query.access_token, cb);
    },
    function delLastUpdates(status, cb) {
      store.hdel('lastUpdates', req.query.access_token, cb);
    },
    function response(status, cb) {
      res.send(204);
      cb();
    }
  ], next);
};
