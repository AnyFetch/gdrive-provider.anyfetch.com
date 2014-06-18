"use strict";

module.exports.create = function(queue, type, data) {
  console.log('spawn', type, data);
  return queue
          .create(type, data)
          .priority('high')
          .attempts(5);
};
