"use strict";

module.exports.get = function(req, res, next) {
  var authorizeUrl = req.app.get('googleOAuth').generateAuthUrl({
    scope: "https://www.googleapis.com/auth/drive.readonly",
    approval_prompt: "force",
    access_type: "offline",
    state: req.query.code
  });

  res.redirect(authorizeUrl);
  next();
};
