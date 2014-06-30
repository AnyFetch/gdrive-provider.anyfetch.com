"use strict";

var debug = require('debug');

module.exports = function retrievePageOfChanges(options, client, authClient, intermediaryCb, cb) {
  client.drive.changes
    .list(options)
    .withAuthClient(authClient)
    .execute(function mergePageOfChanges(err, res) {
      if(err) {
        return cb(err);
      }

      intermediaryCb(res.items);
      if(res.nextPageToken) {
        options.pageToken = res.nextPageToken;
        retrievePageOfChanges(options, client, authClient, intermediaryCb, cb);
      } else {
        var cursor = res.items[res.items.length - 1].id;
        debug('info:cursor')('setting cursor', cursor);
        cb(null, cursor);
      }
    });
};
