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

  usersConcurrency: process.env.GDRIVE_USERS_CONCURRENCY || 1,
  concurrency: process.env.GDRIVE_CONCURRENCY || 1,

  mongoUrl: process.env.MONGO_URL || process.env.MONGOLAB_URI,
  redisUrl: process.env.REDIS_URL || process.env.REDISCLOUD_URL,

  googleId: process.env.GDRIVE_API_ID,
  googleSecret: process.env.GDRIVE_API_SECRET,

  appId: process.env.ANYFETCH_API_ID,
  appSecret: process.env.ANYFETCH_API_SECRET,

  providerUrl: process.env.PROVIDER_URL,

  testRefreshToken: process.env.GDRIVE_TEST_REFRESH_TOKEN,

  retry: 2,
  retryDelay: 20 * 1000,

  opbeat: {
    organizationId: process.env.OPBEAT_ORGANIZATION_ID,
    appId: process.env.OPBEAT_APP_ID,
    secretToken: process.env.OPBEAT_SECRET_TOKEN
  }
};
