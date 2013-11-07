"use strict";

// Load configuration and initialize server
var cluestrProvider = require('cluestr-provider');

var providerGoogleDrive = require('./lib/provider-google-drive');
var config = require('./config/configuration.js');

var serverHandlers = providerGoogleDrive(config);
var server = cluestrProvider.createServer(serverHandlers);

// Expose the server
module.exports = server;
