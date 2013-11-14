'use strict';

var gapis  = require("googleapis");
var readline = require('readline');


var config = require('./config/configuration.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(config);
var auth = new gapis.OAuth2Client(config.google_drive_id, config.google_drive_secret, config.google_drive_connect);

gapis.discover('drive', 'v2').execute(function(err) {
  if(err) {
    throw err;
  }

  var url = auth.generateAuthUrl({
    scope: "https://www.googleapis.com/auth/drive",
    approval_prompt: "force",
    access_type: "offline"
  });
  var getAccessToken = function(code) {
    auth.getToken(code, function(err, token) {
      if (err) {
        console.log("Error when trying to retrieve refresh token", err);
        return;
      }
      console.log("Your tokens are: " + JSON.stringify(token, null, ' '));
      process.exit();
    });
  };
  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', getAccessToken);
});
