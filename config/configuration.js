/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// Load environment variables from .env file
var dotenv = require('dotenv');
dotenv.load();

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  maxSize: process.env.MAX_SIZE || 50,
  maxConcurrency: process.env.GDRIVE_MAX_CONCURRENCY || 1,

  mongoUrl: process.env.MONGOLAB_URI,
  redisUrl: process.env.REDISCLOUD_URL,

  googleId: process.env.GDRIVE_ID,
  googleSecret: process.env.GDRIVE_SECRET,
  
  appId: process.env.GDRIVE_ANYFETCH_ID,
  appSecret: process.env.GDRIVE_ANYFETCH_SECRET,

  providerUrl: process.env.PROVIDER_URL,

  testRefreshToken: process.env.GDRIVE_TEST_REFRESH_TOKEN
};
