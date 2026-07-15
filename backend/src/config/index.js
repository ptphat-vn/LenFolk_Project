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
  // ── Email (Nodemailer / SMTP) ────────────────────────────────────────────
  MAIL_HOST: z.string().default(''),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_SECURE: z.coerce.boolean().default(false), // true nếu dùng cổng 465
  MAIL_USER: z.string().default(''),
  MAIL_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('LenFolk <onboarding@resend.dev>'),
  // ── Resend (HTTP email API qua HTTPS 443 — không bị Render chặn như SMTP) ──
  RESEND_API_KEY: z.string().default(''),
  // Brevo (Sendinblue) — gửi email qua HTTP API, xác thực 1 email người gửi (không cần domain)
  BREVO_API_KEY: z.string().default(''),
  // AI analysis providers
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default('gpt-4o-mini-transcribe'),
  OPENAI_ANALYSIS_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_ANALYSIS_MODEL: z.string().default('gemini-2.5-flash'),
  // Địa chỉ nhận phản hồi (Reply-To). Nên là hộp thư có người đọc, vd support@domain.
  MAIL_REPLY_TO: z.string().default(''),
  APP_NAME: z.string().default('LenFolk'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  // ── Google OAuth (đăng nhập bằng Google) ─────────────────────────────────
  // Client ID lấy từ Google Cloud Console → Credentials → OAuth 2.0 Client IDs
  GOOGLE_IOS_CLIENT_ID: z.string().default(''),
  GOOGLE_WEB_CLIENT_ID: z.string().default(''),
  GOOGLE_ANDROID_CLIENT_ID: z.string().default(''),
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
  mail: {
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_SECURE,
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
    from: env.MAIL_FROM,
    resendApiKey: env.RESEND_API_KEY,
    brevoApiKey: env.BREVO_API_KEY,
    replyTo: env.MAIL_REPLY_TO,
  },
  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    openaiTranscriptionModel: env.OPENAI_TRANSCRIPTION_MODEL,
    openaiAnalysisModel: env.OPENAI_ANALYSIS_MODEL,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiAnalysisModel: env.GEMINI_ANALYSIS_MODEL,
  },
  google: {
    iosClientId: env.GOOGLE_IOS_CLIENT_ID,
    webClientId: env.GOOGLE_WEB_CLIENT_ID,
    androidClientId: env.GOOGLE_ANDROID_CLIENT_ID,
    // Danh sách audience hợp lệ để xác thực idToken (bỏ giá trị rỗng)
    get audiences() {
      return [this.iosClientId, this.webClientId, this.androidClientId].filter(Boolean);
    },
  },
  appName: env.APP_NAME,
  clientUrl: env.CLIENT_URL,
};
