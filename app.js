"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var kue = require('kue');
var redis = require('redis');
var debug = require('debug');
var gApis = require('googleapis');
var config = require('./config/index.js');
var routes = require('./routes/routes.js');


// Create the server
var app = express();

// Bind global values
config(app);
app.set('keyValueStore', redis.createClient(
  app.get('redis.port'),
  app.get('redis.host'),
  {
    auth_pass: app.get('redis.auth')
  }
));
debug('boot:redis')('key/value store ready');
app.set('queue', kue.createQueue({
  prefix: app.get('redis.queuePrefix'),
  redis: {
    port: app.get('redis.port'),
    host: app.get('redis.host'),
    auth: app.get('redis.auth')
  }
}));
debug('boot:redis')('job queue ready');
app.set('googleOAuth', new gApis.OAuth2Client(
  app.get('gdrive.apiId'),
  app.get('gdrive.apiSecret'),
  app.get('gdrive.redirectUri')
));
debug('boot:googleapis')('oauth client ready');

// Apply middleware
app.use(bodyParser());

// Apply routes
routes(app);

// Return
module.exports = app;
