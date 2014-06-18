"use strict";

var nock = require('nock');

var mock = nock("http://downloads");

mock.get('/gdoc.pdf')
  .replyWithFile(200, __dirname + '/downloads/gdoc.pdf');
