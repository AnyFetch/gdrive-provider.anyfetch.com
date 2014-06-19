"use strict";

var nock = require('nock');
var qs = require('querystring');
var app = require('../../app.js');

var mock = nock(app.get('anyfetch.managerUrl'));
mock.post('/oauth/access_token', qs.stringify({
  client_id: app.get('anyfetch.apiId'),
  client_secret: app.get('anyfetch.apiSecret'),
  redirect_uri: app.get('anyfetch.redirectUri'),
  code: 'aCode',
  grant_type: 'authorization_code'
})).reply(200, {
  access_token: "anAccessToken"
});
