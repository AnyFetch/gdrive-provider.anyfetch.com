"use strict";

var mocks = require('../test/mock/index.js');

module.exports = function(app) {
  //mocks.attach(app.get('gdrive.apiUrl'), 'drive');

  app.set('gdrive.apiId',       'aClientId');
  app.set('gdrive.apiSecret',   'aClientSecret');
  app.set('gdrive.redirectUri', 'http://localhost:3000/init/callback');
};
