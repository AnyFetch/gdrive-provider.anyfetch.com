"use strict";

var nock = require('nock');
var qs = require('querystring');
var app = require('../../app.js');

var mock = nock(app.get('gdrive.accountServer'));

mock.post('/o/oauth2/token', qs.stringify({
  code: 'aGoogleCode',
  client_id: app.get('gdrive.apiId'),
  client_secret: app.get('gdrive.apiSecret'),
  redirect_uri: app.get('gdrive.redirectUri'),
  grant_type: 'authorization_code'
})).reply(200, {
  access_token: "aGoogleAccessToken",
  refresh_token: "aGoogleRefreshToken",
  expires_in: 3920,
  token_type: "Bearer"
});

mock.post('/o/oauth2/token',  qs.stringify({
  refresh_token: 'aGoogleRefreshToken',
  client_id: app.get('gdrive.apiId'),
  client_secret: app.get('gdrive.apiSecret'),
  grant_type: 'refresh_token'
})).reply(200, {
  access_token: "aGoogleAccessToken",
  expires_in: 3920,
  token_type: "Bearer"
});
