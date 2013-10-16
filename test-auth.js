'use strict';

var gapis  = require("googleapis");
var readline = require('readline');


var config = require('./config/configuration.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var auth = new gapis.OAuth2Client(config.gdrive_id, config.gdrive_secret, config.gdrive_connect);

gapis.discover('drive', 'v2').execute(function(err, client) {
  var url = auth.generateAuthUrl({ scope: "https://www.googleapis.com/auth/drive" });
  var getAccessToken = function(code) {
    auth.getToken(code, function(err, token) {
      if (err) {
        console.log("Error when trying to retrieve access token", err);
        return;
      }
      console.log("Your access token is: " + token.access_token);
      process.exit();
    });
  };
  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', getAccessToken);
});
