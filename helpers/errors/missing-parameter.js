"use strict";

var express = require('express');
var util = require('util');

var errName = 'MissingParameter';

function MissingParameter(message) {
  this.name = errName;
  this.status = 409;
  this.message = message;
}

util.inherits(MissingParameter, Error);
express.errors = express.errors || {};
express.errors[errName] = MissingParameter;
