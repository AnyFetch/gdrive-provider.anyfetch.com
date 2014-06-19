"use strict";

module.exports = function(app) {
  app.set('gdrive.apiId', 'aClientId');
  app.set('gdrive.apiSecret', 'aClientSecret');
  app.set('gdrive.redirectUri', 'http://localhost:3000/init/callback');

  app.set('anyfetch.apiId', 'aClientId');
  app.set('anyfetch.apiSecret', 'aClientSecret');
  app.set('anyfetch.redirectUri', 'http://localhost:3000/init/connect');
};
