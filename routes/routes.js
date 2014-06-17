"use strict";

var kue = require('kue');
var autoload = require('auto-load');
var routes = autoload(__dirname);

module.exports = function(app) {
  app.del('/reset', routes.reset.del);
  app.get('/init/connect', routes.init.connect.get);
  app.get('/init/callback', routes.init.callback.get);

  // Setup kue webinterface
  kue.app.set('title', app.get('title'));
  app.use('/queue', kue.app);
};
