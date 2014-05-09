"use strict";

// Load configuration and initialize server
var anyfetchProvider = require('anyfetch-provider');

var providerGoogleDrive = require('./lib/');
var config = require('./config/configuration.js');

var serverHandlers = providerGoogleDrive(config);
var server = anyfetchProvider.createServer(serverHandlers);

// Expose the server
module.exports = server;
