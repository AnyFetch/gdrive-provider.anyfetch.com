"use strict";

var gApis = require('googleapis');

module.exports.get = function(req, res) {
  var authorizeUrl = new gApis.OAuth2Client(
    req.app.get('gdrive.apiId'),
    req.app.get('gdrive.apiSecret'),
    req.app.get('gdrive.redirectUri')
  ).generateAuthUrl({
    scope: "https://www.googleapis.com/auth/drive.readonly",
    approval_prompt: "force",
    access_type: "offline",
    state: req.query.code
  });

  res.redirect(authorizeUrl);
  res.end();
};
