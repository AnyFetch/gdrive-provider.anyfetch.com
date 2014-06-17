"use strict";

var async = require('async');

module.exports.get = function(req, res, next) {
  var store = req.app.get('keyValueStore');
  var statusResponse = {
    anyfetch_token: req.query.access_token
  };
  async.waterfall([
    function getCursor(cb) {
      store.hget('cursors', req.query.access_token, cb);
    },
    function getStatus(cur, cb) {
      statusResponse.cursor = cur;

      store.hget('status', req.query.access_token, cb);
    },
    function getLastUpdate(status, cb) {
      statusResponse.is_updating = status;

      store.hget('lastUpdates', req.query.access_token, cb);
    },
    function sendResponse(last, cb) {
      statusResponse.last_update = last;

      res.json(statusResponse);
      cb();
    }
  ], next);
};
