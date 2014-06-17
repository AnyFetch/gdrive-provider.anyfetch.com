"use strict";

var async = require('async');
var rarity = require('rarity');

module.exports.get = function(req, res, next) {
  if(req.query.error || !req.query.code || !req.query.state) {
    return next(new Error(req.query.error || "some parameters are missing"));
  }

  async.waterfall([
    function getGoogleRefreshToken(cb) {
      req.app.get('googleOAuth').getToken(req.query.code, cb);
    },
    function getAnyFetchAccessToken(tokens, res, cb) {
      req.app.get('afOAuth').getAccessToken(
        req.query.state,
        req.app.get('anyfetch.redirectUri'),
        rarity.carry([tokens.refresh_token], cb)
      );
    },
    function saveTokens(googleToken, afToken, cb) {
      req.app.get('keyValueStore')
        .hset('googleTokens', afToken, googleToken, cb);
    },
    function redirect(reply, cb) {
      res.redirect(req.app.get('anyfetch.managerUrl') + '/tokens');
      cb();
    }
  ], next);
};
