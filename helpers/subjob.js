"use strict";

var debug = require('debug');

module.exports.create = function(queue, type, data) {
  debug('info:redis')('create job ', data.title, ' of type ', type);
  return queue
          .create(type, data)
          .priority('high')
          .attempts(5)
          .save();
};
