"use strict";

var async = require('async');

module.exports.get = function(req, res, next) {
  var store = req.app.get('keyValueStore');
  var status = {
    anyfetch_token: req.query.access_token
  };
  async.waterfall([
    function getCursor(cb) {
      store.hget('cursors', status.anyfetch_token, cb);
    },
    function getStatus(cur, cb) {
      status.cursor = cur;

      store.hget('status', status.anyfetch_token, cb);
    },
    function getLastUpdate(stat, cb) {
      status.is_updating = stat;

      store.hget('lastUpdates', status.anyfetch_token, cb);
    },
    function sendResponse(last, cb) {
      status.last_update = last;

      res.json(status);
      cb();
    }
  ], next);
};
