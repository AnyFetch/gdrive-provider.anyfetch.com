"use strict";

module.exports = function(app) {

  // Basic configuration
  app.set('title', process.env.TITLE || "Provider Google Drive");
  app.set('env', process.env.NODE_ENV || "development");
  app.set('port', process.env.PORT || 3000);
  app.set('concurrency', process.env.CONCURRENCY || 5);

  // Redis for job queues
  app.set('redis.queuePrefix', process.env.REDIS_QUEUE_PREFIX || 'gdrive-provider');
  app.set('redis.port', process.env.REDIS_PORT || 6379);
  app.set('redis.host', process.env.REDIS_HOST || '127.0.0.1');
  app.set('redis.auth', process.env.REDIS_AUTH || null);

  // GDrive OAuth informations
  app.set('gdrive.apiUrl', process.env.GDRIVE_API_URL || "https://www.googleapis.com");
  app.set('gdrive.accountServer', process.env.GDRIVE_ACCOUNT_SERVER || "https://accounts.google.com");
  app.set('gdrive.apiId', process.env.GDRIVE_API_ID);
  app.set('gdrive.apiSecret', process.env.GDRIVE_API_SECRET);
  app.set('gdrive.redirectUri', process.env.GDRIVE_REDIRECT_URI);

  // AnyFetch OAuth informations
  app.set('anyfetch.apiUrl', process.env.ANYFETCH_API_URL || "https://api.anyfetch.com");
  app.set('anyfetch.managerUrl', process.env.ANYFETCH_MANAGER_URL || "https://manager.anyfetch.com");
  app.set('anyfetch.apiId', process.env.ANYFETCH_API_ID);
  app.set('anyfetch.apiSecret', process.env.ANYFETCH_API_SECRET);
  app.set('anyfetch.redirectUri', process.env.ANYFETCH_REDIRECT_URI);

  // Environment-bound configuration
  require('./' + app.get('env') + '.js')(app);
};
