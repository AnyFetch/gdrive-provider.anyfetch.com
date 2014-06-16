"use_strict";

var nock = require('nock');

/** Attaches a mock api server
 *
 * @param root The root URL of the API
 * @param name The json mock server to attach
 *
 * Example for the json mock server:
 *
 * {
 *   "headers": {
 *     "Content-Type": "application/json"
 *   },
 *   "/": {
 *     "GET": {
 *       "code": 200,
 *       "body": "hello world",
 *       "headers": {
 *         "X-Powered-By": "Express"
 *       }
 *     }
 *   }
 * }
 */
module.exports.attach = function(root, name) {
  if(!this.apis) {
    this.apis = {};
  }
  var mock = require(name + '.json');
  var api = nock(root);
  if(mock.headers) {
    api.defaultReplyHeaders(mock.headers);
    mock.headers = undefined;
  }
  for(var path in mock) {
    var actions = mock[path];
    for(var verb in actions) {
      var res = actions[verb];
      api.intercept(path, verb);
      api.reply(res.code, res.body, res.headers);
    }
  }
  this.apis[name] = api;
}.bind(module.exports);

/** Detaches a mock api
 *
 * @param name The json mock server to detach
 */
module.exports.detach = function(name) {
  this.apis[name].restore();
}.bind(module.exports);
