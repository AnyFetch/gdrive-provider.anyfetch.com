"use strict";

var nock = require('nock');
var autoload = require('auto-load');
var mocks = autoload(__dirname);

/** Attaches a mock api server
 *
 * @param root The root URL of the API
 * @param name The mock server to attach
 */
module.exports.attach = function(root, name) {
  if(!this.apis) {
    this.apis = {};
  }
  var api = nock(root);
  mocks[name](api);
  this.apis[name] = api;
}.bind(module.exports);

/** Detaches a mock api
 *
 * @param name The json mock server to detach
 */
module.exports.detach = function(name) {
  this.apis[name].restore();
}.bind(module.exports);
