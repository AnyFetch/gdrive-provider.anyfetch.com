"use strict";

var util = require('util');

function NotFoundError(message) {
  this.message = message || 'Not Found';
  this.status = 404;
}
util.inherits(NotFoundError, Error);
module.exports.NotFoundError = NotFoundError;

function TooManyRequestsError(message) {
  this.message = message || 'Too Many Requests';
  this.status = 429;
}
util.inherits(TooManyRequestsError, Error);
module.exports.TooManyRequestsError = TooManyRequestsError;
