'use strict';

module.exports = function(config) {
  return {
    initAccount: null,
    connectAccountRetrievePreDatasIdentifier: null,
    connectAccountRetrieveAuthDatas: null,
    updateAccount: null,
    queueWorker: null,

    cluestrAppId: config.cluestr_id,
    cluestrAppSecret: config.cluestr_secret,
    connectUrl: config.connect_url
  };
};
