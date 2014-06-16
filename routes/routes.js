"use_strict";

var kue = require('kue');
var autoload = require('auto-load');
var routes = autoload(__dirname);

module.exports = function(app) {

  kue.app.set('title', app.get('title'));
  app.use('/queue', kue.app);
};
