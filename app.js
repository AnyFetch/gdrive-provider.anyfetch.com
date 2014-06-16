"use_strict";

var restify = require('restify');
var kue = require('kue');
var redis = require('redis');
var debug = require('debug');
var config = require('./config/index.js')();
var routes = require('./routes/routes.js');

// Create the server
var app = restify.createServer();
debug('boot:restify')('app created');

// Bind global values
debug('boot:config')('binding config', config);
app.config = config;
app.store  = redis.createClient(
  config.redis.port,
  config.redis.host,
  {
    auth_pass: config.redis.auth
  }
);
debug('boot:redis')('key/value store ready');
app.queue  = kue.createQueue({
  prefix: config.redis.queuePrefix,
  redis: {
    port: config.redis.port,
    host: config.redis.host,
    auth: config.redis.auth
  }
});
debug('boot:redis')('job queue ready');

// Apply middleware
app.use(restify.acceptParser(app.acceptable));
app.use(restify.queryParser());
app.use(restify.bodyParser());
debug('boot:restify')('middleware ready');

// Apply routes
routes(app);
debug('boot:restify')('routes ready');

// Return
module.exports = app;
