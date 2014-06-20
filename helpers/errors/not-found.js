"use strict";

var express = require('express');
var util = require('util');

var errName = 'Not Found';

function NotFound(message) {
  this.name = errName;
  this.statusCode = 404;
  this.message = message;
}

util.inherits(NotFound, Error);
express.errors = express.errors || {};
express.errors[errName] = NotFound;
