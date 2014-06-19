"use strict";

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
        cb(null, res.items[res.items.length - 1].id);
      }
    });
};
