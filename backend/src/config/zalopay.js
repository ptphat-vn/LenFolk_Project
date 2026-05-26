require('dotenv').config();

const zalopayConfig = {
  app_id: process.env.ZALOPAY_APP_ID || '2553', // Sandbox App ID default
  key1: process.env.ZALOPAY_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL', // Sandbox Key 1 default
  key2: process.env.ZALOPAY_KEY2 || 'kLtgPl8YEStV61e9R1e7CgO7p3sDxt5I', // Sandbox Key 2 default
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  query_endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
};

module.exports = zalopayConfig;
