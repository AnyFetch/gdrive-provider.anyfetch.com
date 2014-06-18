"use strict";

function retrievePageOfChanges(changes, options, client, authClient, cb) {
  client.drive.changes
    .list(options)
    .withAuthClient(authClient)
    .execute(function mergePageOfChanges(err, res) {
      if(err) {
        return cb(err);
      }

      changes = changes.concat(res.items);
      if(res.nextPageToken) {
        options.pageToken = res.nextPageToken;
        retrievePageOfChanges(changes, options, client, authClient, cb);
      } else {
        cb(null, changes);
      }
    });
}

module.exports = function(options, client, authClient, cb) {
  retrievePageOfChanges([], options, client, authClient, cb);
};
