'use strict';

var url = require('url');
var https = require('https');
var async = require('async');
var rarity = require('rarity');
var crypto = require('crypto');
var fs = require('fs');

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

      var req = https.request(options, rarity.pad([null], cb));

      req.on('error', cb);
      req.end();
    },
    function generateStream(res, cb) {
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
        identifier: task.id,
        actions: {
          show: task.id
        },
        creation_date: task.date,
        metadata: {
          title: task.title,
          starred: task.starred
        },
        data: {
          path: '/' + task.title
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
