'use strict';
/**
 * @file Retrieve files for the account
 */

/**
 * Download all files from the specified Google Account.
 *
 * @param {String} refreshToken Refresh_token to identify the account
 * @param {Date} since Retrieve contacts updated since this date
 * @param {Function} cb Callback. First parameter is the error (if any), second an array of all the contacts.
 */
module.exports = function retrieveFiles(client, oauth2Client, options, changes, cb) {
  client.drive.changes
    .list(options)
    .withAuthClient(oauth2Client)
    .execute(function(err, res) {
      if(err) {
        return cb(err);
      }

      changes = changes.concat(res.items);

      if(res.nextPageToken) {
        options.pageToken = res.nextPageToken;
        retrieveFiles(client, oauth2Client, options, changes, cb);
      }
      else {
        cb(null, res.items.length > 0 ? res.items[res.items.length - 1].id : options.startChangeId, changes);
      }
    });
};
