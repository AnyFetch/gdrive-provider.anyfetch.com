"use_strict";

var autoload = require('auto-load');
var jobs = autoload(__dirname);

module.exports = function(app) {
  var queue = app.get('queue');

  for(var job in jobs) {
    queue.process(job, jobs[job]);
  }
};
