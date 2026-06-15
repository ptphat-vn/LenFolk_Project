const crypto = require('crypto');

const OTP_TTL_MINUTES = 10;

// Sinh mã OTP 6 chữ số (chuỗi, có thể bắt đầu bằng 0).
const generateOtp = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

// Hash OTP để lưu DB (không lưu mã thô).
const hashOtp = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

// Mốc hết hạn tính từ bây giờ.
const otpExpiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

module.exports = { generateOtp, hashOtp, otpExpiry, OTP_TTL_MINUTES };
