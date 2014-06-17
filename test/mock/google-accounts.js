"use strict";

var nock = require('nock');
var app = require('../../app.js');

var mock = nock(app.get('gdrive.accountServer'));

mock.post('/o/oauth2/token', {
  code: 'aGoogleCode',
  client_id: app.get('gdrive.mockId'),
  client_secret: app.get('gdrive.mockSecret'),
  redirect_uri: app.get('gdrive.redirectUri'),
  grant_type: 'authorization_code'
}).reply(200, {
  access_token: "aGoogleAccessToken",
  refresh_token: "aGoogleRefreshToken",
  expires_in: 3920,
  token_type: "Bearer"
});

mock.post('/o/oauth2/token', {
  refresh_token: 'aRefreshToken',
  client_id: app.get('gdrive.mockId'),
  client_secret: app.get('gdrive.mockSecret'),
  grant_type: 'refresh_token'
}).reply(200, {
  access_token: "aGoogleAccessToken",
  expires_in: 3920,
  token_type: "Bearer"
});
