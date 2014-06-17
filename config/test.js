"use strict";

module.exports = function(app) {
  app.set('gdrive.apiId',       'aClientId');
  app.set('gdrive.apiSecret',   'aClientSecret');
  app.set('gdrive.redirectUri', 'http://localhost:3000/init/callback');
};
