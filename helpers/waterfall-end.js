"use strict";

module.exports = function(cb) {
  return function waterfallEnd(err) {
    if(err) {
      cb(err);
    }
  };
};
