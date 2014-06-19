"use strict";

var nock = require('nock');

var mock = nock("https://googleusercontent.com");

mock.get('/gdoc.pdf')
  .replyWithFile(200, __dirname + '/downloads/gdoc.pdf');
