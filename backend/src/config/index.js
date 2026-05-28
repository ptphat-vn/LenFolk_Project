const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, { message: 'MONGO_URI is required' }),
  JWT_SECRET: z.string().min(8, { message: 'JWT_SECRET must be at least 8 characters long' }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('30m'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, { message: 'CLOUDINARY_CLOUD_NAME is required' }),
  CLOUDINARY_API_KEY: z.string().min(1, { message: 'CLOUDINARY_API_KEY is required' }),
  CLOUDINARY_API_SECRET: z.string().min(1, { message: 'CLOUDINARY_API_SECRET is required' }),
  ZALOPAY_APP_ID: z.string().default('2553'),
  ZALOPAY_KEY1: z.string().default('PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL'),
  ZALOPAY_KEY2: z.string().default('kLtgPl8YEStV61e9R1e7CgO7p3sDxt5I'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('💥 Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  zalopay: {
    appId: env.ZALOPAY_APP_ID,
    key1: env.ZALOPAY_KEY1,
    key2: env.ZALOPAY_KEY2,
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
    queryEndpoint: 'https://sb-openapi.zalopay.vn/v2/query',
  },
};
