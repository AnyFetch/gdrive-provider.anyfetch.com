"use strict";

var async = require('async');
var AnyFetch = require('anyfetch');

module.exports = function(app) {
  return function(job, done) {
    async.waterfall([
      function deleteFile(cb) {

        var anyfetchAuthClient = new AnyFetch(
          app.get('anyfetch.apiId'),
          app.get('anyfetch.apiSecret'),
          app.get('anyfetch.apiUrl'),
          app.get('anyfetch.managerUrl')
        );
        anyfetchAuthClient.setAccessToken(job.data.anyfetchToken);

        anyfetchAuthClient.deleteDocument(job.data.id, cb);
      },
      function formatSuccess(res, cb) {
        cb(null, true);
      }
    ], done);
  };
};
