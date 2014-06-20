"use strict";

var express = require('express');
var util = require('util');

var errName = 'Too Many Requests';

function TooManyRequests(message) {
  this.name = errName;
  this.status = 429;
  this.message = message;
}

util.inherits(TooManyRequests, Error);
express.errors = express.errors || {};
express.errors[errName] = TooManyRequests;
