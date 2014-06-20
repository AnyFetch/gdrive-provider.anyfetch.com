"use strict";

var nock = require('nock');

var app = require('../../app.js');
var mock = nock(app.get('anyfetch.apiUrl'));

mock.post('/documents', {
  identifier: 'http://gdrive.provider.anyfetch.com/file0',
  actions: {
    show: "http://downloads/show/gdoc"
  },
  metadata: {
    title: 'Awesome document.pdf',
    path: 'http://gdrive.provider.anyfetch.com/file0/Awesome document.pdf'
  },
  creation_date: "somedate",
  document_type: 'document',
  user_access: [ 'anAccessToken' ]
}).reply(200, {
    _type: "Document",
    id: "document0"
});

mock.post('/documents/identifier/http%3A%2F%2Fgdrive.provider.anyfetch.com%2Ffile0/file').reply(204);

mock.delete('/documents/identifier/http%3A%2F%2Fgdrive.provider.anyfetch.com%2Ffile0').reply(204);
