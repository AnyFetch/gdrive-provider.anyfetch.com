"use strict";

var nock = require('nock');
var qs = require('querystring');
var app = require('../../app.js');

var mock = nock(app.get('gdrive.apiUrl'));

mock.get('/drive/v2/changes?' + qs.stringify({
  maxResults: 1000,
  startChangeId: null,
  includeDeleted: false
})).reply(200, {
  "kind": "drive#changeList",
  "nextPageToken": "page1",
  "items": []
});

mock.get('/drive/v2/changes?' + qs.stringify({
  maxResults: 1000,
  startChangeId: null,
  includeDeleted: false,
  pageToken: "page1"
})).reply(200, {
  kind: "drive#changeList",
  items: [
    {
      kind: "drive#change",
      id: "change0",
      fileId: "file0",
      deleted: false,
      modificationDate: Date.now(),
      file: {
        kind: "drive#file",
        id: "file0"
      }
    }
  ]
});
