"use strict";


// Pass to the next express middleware only when errors rise
module.exports = function(cb) {
  return function waterfallEnd(err) {
    if(err) {
      cb(err);
    }
  };
};
