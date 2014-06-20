"use strict";

var kue = require('kue');
var autoload = require('auto-load');
var routes = autoload(__dirname);

module.exports = function(app) {
  app.delete('/reset', routes.reset.del);
  app.get('/status', routes.status.get);
  app.post('/update', routes.update.post);
  app.get('/init/connect', routes.init.connect.get);
  app.get('/init/callback', routes.init.callback.get);

  // Setup kue webinterface
  if(app.get('kueWeb')) {
    kue.app.set('title', app.get('title'));
    app.use('/queue', kue.app);
  }
};
