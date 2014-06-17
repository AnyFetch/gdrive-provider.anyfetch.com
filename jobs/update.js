"use strict";

var async = require('async');
var app = require('../app.js');

module.exports = function(app) {
  return function(job, done) {
    done(null, "curcur");
  };
};
