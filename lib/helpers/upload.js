'use strict';

var url = require('url');
var https = require('follow-redirects').https;
var async = require('async');
var rarity = require('rarity');
var crypto = require('crypto');
var fs = require('fs');
var generateTitle = require('anyfetch-provider').util.generateTitle;

/**
 * Upload file onto AnyFetch.
 *
 *
 * @param {Object} task Data of the task
 * @param {Object} anyfetchClient Client for upload
 * @param {Object} accessToken Access token of the current account
 * @param {Function} cb Callback to call once file has been uploaded.
 */
module.exports = function(task, anyfetchClient, accessToken, cb) {
  var path = '/tmp/' + crypto.randomBytes(20).toString('hex');

  /*
   * We don't know what GDrive do when we export file (Google Drive converted files)
   * And if we don't save this files in tmp files, we have error "400 Bad Request" with NGinx
   * So, normal files without export links are direct streamed to the API and others pass through a temp file
   */

  if(!task.downloadUrl) {
    return cb(null);
  }

  async.waterfall([
    function requestFile(cb) {
      var options = url.parse(task.downloadUrl);
      options.headers = {
        'Authorization': 'Bearer ' + accessToken
      };

      // We need to set this header, without we have a socket hang up with direct stream
      if(!task.exported) {
        options.headers = {"Connection" : "close"};
      }

      // Google can have random 500 error. So we must do an exponential backoff.
      // See http://stackoverflow.com/questions/12471180/frequently-http-500-internal-error-with-google-drive-api-drive-files-get
      var time = 200;
      function tryRequest(cb) {
        var req = https.request(options, function(res) {
          if(res.statusCode !== 500 || time > 13000) {
            return cb(null, res);
          }

          time *= 2;
          setTimeout(function() {
            tryRequest(cb);
          }, time);
        });

        req.on('error', cb);
        req.end();
      }

      tryRequest(cb);
    },
    function generateStream(res, cb) {
      if(res.statusCode !== 200) {
        return cb(new Error('GDrive bad status code : ' + res.statusCode));
      }

      if(!task.exported) {
        return cb(null, res);
      }

      var stream = fs.createWriteStream(path);
      stream.on('error', cb);

      res.on('end', function() {
        cb(null, path);
      });

      res.pipe(stream);
    },
    function sendFile(data, cb) {
      var fileConfig = function(cb) {
        cb(null, {
          file: (task.exported) ? fs.createReadStream(path) : data,
          filename: task.title
        });
      };

      var document = {
        identifier: task.identifier,
        actions: {
          show: task.link
        },
        creation_date: task.createdDate,
        modification_date: task.modifiedDate,
        metadata: {
          title: generateTitle(task.title),
          path: '/' + task.title,
          starred: task.starred
        },
        document_type: task.type,
        user_access: [anyfetchClient.accessToken]
      };

      anyfetchClient.sendDocumentAndFile(document, fileConfig, rarity.slice(1, cb));
    },
    function deleteTempFile(cb) {
      if(task.exported) {
        fs.unlink(path, cb);
      }
      else {
        cb(null);
      }
    }
  ], cb);
};
