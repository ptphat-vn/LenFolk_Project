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
  // ── SePay ────────────────────────────────────────────────────────────────
  // API Key khai báo trong SePay Dashboard → Webhooks → Authorization (Api Key)
  SEPAY_WEBHOOK_API_KEY: z.string().default(''),
  // Số tài khoản ngân hàng đã liên kết với SePay
  SEPAY_ACCOUNT_NUMBER: z.string().default(''),
  // Mã ngân hàng theo SePay (vd: MBBank, Vietcombank, ACB, TPBank, BIDV...)
  SEPAY_BANK_CODE: z.string().default(''),
  // Tên chủ tài khoản (chỉ để hiển thị)
  SEPAY_ACCOUNT_NAME: z.string().default(''),
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
  sepay: {
    webhookApiKey: env.SEPAY_WEBHOOK_API_KEY,
    accountNumber: env.SEPAY_ACCOUNT_NUMBER,
    bankCode: env.SEPAY_BANK_CODE,
    accountName: env.SEPAY_ACCOUNT_NAME,
    // Bộ sinh ảnh VietQR động của SePay
    qrImageBase: 'https://qr.sepay.vn/img',
  },
};
