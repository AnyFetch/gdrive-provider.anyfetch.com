"use strict";

var kue = require('kue');
var autoload = require('auto-load');
var routes = autoload(__dirname);

module.exports = function(app) {
  app.get('/init/connect', routes.init.connect.get);

  // Setup kue webinterface
  kue.app.set('title', app.get('title'));
  app.use('/queue', kue.app);
};
