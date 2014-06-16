"use_strict";

var kue = require('kue');

module.exports = function(app) {

  kue.app.set('title', app.get('title'));
  app.use('/queue', kue.app);
};
