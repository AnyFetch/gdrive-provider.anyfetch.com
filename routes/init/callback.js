"use strict";

var async = require('async');

module.exports.get = function(req, res, next) {
  if(req.query.error || !req.query.code || !req.query.state) {
    return next(new Error(req.query.error || "some parameters are missing"));
  }

  async.waterfall([
    function getGoogleRefreshToken(cb) {
      req.app.get('googleOAuth').getToken(req.query.code, cb);
    },
    function getAnyFetchAccessToken(tokens, res, cb) {
      this.googleRefreshToken = tokens.refresh_token;

      req.app.get('afOAuth').getAccessToken(
        req.query.state,
        req.app.get('anyfetch.redirectUri'),
        cb
      );
    }.bind(this),
    function saveTokens(afToken, cb) {
      req.app.get('keyValueStore')
        .hset('googleTokens', afToken, this.googleRefreshToken, cb);
    }.bind(this),
    function redirect(reply, cb) {
      res.redirect(req.app.get('anyfetch.managerUrl') + '/tokens');
      cb();
    }
  ], next);
};
