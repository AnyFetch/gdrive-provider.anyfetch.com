"use_strict";

var mocks = require('../test/mock/index.js');

module.exports = function(config) {
  mocks.attach(config.gdrive.apiUrl, 'drive');

  return config;
};
