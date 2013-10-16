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

if(!process.env.GDRIVE_CONNECT_URL) {
  console.log("Connect url not specified, oAuth will not work.");
}

// Exports configuration for use by app.js
module.exports = {
  env: node_env,
  port: process.env.PORT || default_port,
  mongo_url: process.env.MONGO_URL || ("mongodb://localhost/provider-google-drive-" + node_env),

  gdrive_id: process.env.GDRIVE_ID,
  gdrive_secret: process.env.GDRIVE_SECRET,
  gdrive_callback: process.env.GDRIVE_CALLBACK_URL,
  gdrive_connect: process.env.GDRIVE_CONNECT_URL,

  cluestr_id: process.env.GDRIVE_CLUESTR_ID,
  cluestr_secret: process.env.GDRIVE_CLUESTR_SECRET,

  max_concurrency: process.env.GDRIVE_MAX_CONCURRENCY || 5,

  test_tokens: {
    oauth_token_secret: process.env.GDRIVE_TEST_OAUTH_TOKEN_SECRET,
    oauth_token: process.env.GDRIVE_TEST_OAUTH_TOKEN,
    uid: process.env.DROPBOX_TEST_UID,
  },
  test_cursor: process.env.GDRIVE_TEST_CURSOR
};
