"use_strict";

module.exports = function(config) {
  if(!config) {
    config = {};
  }

  // Basic configuration
  config.env  = process.env.NODE_ENV || "development";
  config.port = process.env.PORT     || 3000;

  // Redis for job queues
  config.redis = {};
  config.redis.queuePrefix = process.env.REDIS_QUEUE_PREFIX || 'gdrive-provider';
  config.redis.port        = process.env.REDIS_PORT || 6379;
  config.redis.host        = process.env.REDIS_HOST || '127.0.0.1';
  config.redis.auth        = process.env.REDIS_AUTH || null;

  // GDrive OAuth informations
  config.gdrive = {};
  config.gdrive.apiUrl      = process.env.GDRIVE_API_URL || "https://www.googleapis.com";
  config.gdrive.apiId       = process.env.GDRIVE_API_ID;
  config.gdrive.apiSecret   = process.env.GDRIVE_API_SECRET;
  config.gdrive.redirectUri = process.env.GDRIVE_REDIRECT_URI;

  // AnyFetch OAuth informations
  config.anyfetch = {};
  config.anyfetch.apiUrl      = process.env.ANYFETCH_API_URL || "https://api.anyfetch.com";
  config.anyfetch.managerUrl  = process.env.ANYFETCH_MANAGER_URL || "https://manager.anyfetch.com";
  config.anyfetch.apiId       = process.env.ANYFETCH_API_ID;
  config.anyfetch.apiSecret   = process.env.ANYFETCH_API_SECRET;
  config.anyfetch.redirectUri = process.env.ANYFETCH_REDIRECT_URI;

  // Environment-bound configuration
  config = require('./' + config.env + '.js')(config);

  return config;
};
