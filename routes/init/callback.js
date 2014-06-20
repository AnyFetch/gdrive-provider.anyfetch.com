"use strict";

var async = require('async');
var rarity = require('rarity');
var gApis = require('googleapis');
var AnyFetch = require('anyfetch');
var wEnd = require('../../helpers/waterfall-end.js');

module.exports.get = function(req, res, next) {
  if(req.query.error || !req.query.code || !req.query.state) {
    return next(new Error(req.query.error || "some parameters are missing"));
  }

  async.waterfall([
    function getGoogleRefreshToken(cb) {
      new gApis.OAuth2Client(
        req.app.get('gdrive.apiId'),
        req.app.get('gdrive.apiSecret'),
        req.app.get('gdrive.redirectUri')
      ).getToken(req.query.code, cb);
    },
    function getAnyFetchAccessToken(tokens, res, cb) {
      new AnyFetch(
        req.app.get('anyfetch.apiId'),
        req.app.get('anyfetch.apiSecret'),
        req.app.get('anyfetch.apiUrl'),
        req.app.get('anyfetch.managerUrl')
      ).getAccessToken(
        req.query.state,
        req.app.get('anyfetch.redirectUri'),
        rarity.carry([tokens.refresh_token], cb)
      );
    },
    function saveTokens(googleRefreshToken, anyfetchToken, cb) {
      req.app.get('keyValueStore')
        .hset('tokens', anyfetchToken, googleRefreshToken, cb);
    },
    function redirect(reply, cb) {
      res.redirect(req.app.get('anyfetch.managerUrl') + '/tokens');
      res.end();
      cb();
    }
  ], wEnd(next));
};
