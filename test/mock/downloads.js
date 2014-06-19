"use strict";

var nock = require('nock');

var mock = nock("https://googleusercontent.com");

mock.get('/gdoc.pdf')
  .reply(200,"wow ! this is actually not a real pdf !");
