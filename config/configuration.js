/**
 * @file Defines the provider settings.
 *
 * Will set the path to Mongo, and applications id
 * Most of the configuration can be done using system environment variables.
 */

// node_env can either be "development" or "production"
var node_env = process.env.NODE_ENV || "development";

// Port to run the app on. 8000 for development
// (Vagrant syncs this port)
// 80 for production
var default_port = 8000;
if(node_env === "production") {
  default_port = 80;
}

if(!process.env.GOOGLE_DRIVE_CONNECT_URL) {
  console.log("Connect url not specified, oAuth will not work.");
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  mongo_url: process.env.MONGO_URL || ("mongodb://localhost/provider-google-drive-" + node_env),

  google_drive_id: process.env.GOOGLE_DRIVE_ID,
  google_drive_secret: process.env.GOOGLE_DRIVE_SECRET,
  google_drive_callback: process.env.GOOGLE_DRIVE_CALLBACK_URL,
  google_drive_connect: process.env.GOOGLE_DRIVE_CONNECT_URL,

  anyfetch_id: process.env.GOOGLE_DRIVE_ANYFETCH_ID,
  anyfetch_secret: process.env.GOOGLE_DRIVE_ANYFETCH_SECRET,

  max_concurrency: process.env.GOOGLE_DRIVE_MAX_CONCURRENCY || 5,

  test_refresh_token: process.env.GOOGLE_DRIVE_TEST_REFRESH_TOKEN
};
