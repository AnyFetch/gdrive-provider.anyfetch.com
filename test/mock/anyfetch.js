"use strict";

var nock = require('nock');

var app = require('../../app.js');
var mock = nock(app.get('anyfetch.apiUrl'));

mock.post('/documents', {
  identifier: 'https://docs.google.com/file/d/file0',
  actions: {
    show: "https://docs.google.com/file/d/file0"
  },
  metadata: {
    title: 'Awesome document.pdf',
    path: '/Awesome document.pdf'
  },
  creation_date: "somedate",
  document_type: 'document',
  user_access: [ 'anAccessToken' ]
}).reply(200, {
    _type: "Document",
    id: "document0"
});

mock.post('/documents/identifier/https%3A%2F%2Fdocs.google.com%2Ffile%2Fd%2Ffile0/file').reply(204);

mock.delete('/documents/identifier/https%3A%2F%2Fdocs.google.com%2Ffile%2Fd%2Ffile0').reply(204);
