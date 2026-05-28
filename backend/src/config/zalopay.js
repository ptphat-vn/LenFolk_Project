const config = require('./index');

const zalopayConfig = {
  app_id: config.zalopay.appId,
  key1: config.zalopay.key1,
  key2: config.zalopay.key2,
  endpoint: config.zalopay.endpoint,
  query_endpoint: config.zalopay.queryEndpoint,
};

module.exports = zalopayConfig;
