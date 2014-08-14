'use strict';
/**
 * @file Retrieve files for the account
 */

var googleapis = require('googleapis');

/**
 * Download all files from the specified Google Account.
 *
 * @param {String} refreshToken Refresh_token to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), second an array of all the contacts.
 */
module.exports = function retrieveFiles(options, changes, cb) {
  googleapis.drive('v2').changes
    .list(options, function(err, res) {
      if(err) {
        return cb(err);
      }

      changes = changes.concat(res.items);

      if(res.nextPageToken) {
        options.pageToken = res.nextPageToken;
        retrieveFiles(options, changes, cb);
      }
      else {
        cb(null, res.items.length > 0 ? parseInt(res.largestChangeId, 10) + 1 : options.startChangeId, changes.reverse());
      }
    });
};
