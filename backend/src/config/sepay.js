const config = require('./index');

const PAY_CODE_PREFIX = 'LF';
const PAY_CODE_REGEX = /LF[0-9A-F]{8}/i;

const buildPayCode = (transactionId) =>
  PAY_CODE_PREFIX + transactionId.toString().slice(-8).toUpperCase();

const extractPayCode = (text) => {
  if (!text) return null;
  const match = String(text).match(PAY_CODE_REGEX);
  return match ? match[0].toUpperCase() : null;
};

/**
 * Thông tin tài khoản nhận tiền SePay, lấy từ biến môi trường SEPAY_*.
 */
const resolveSepayAccount = () => ({
  accountNumber: config.sepay.accountNumber || null,
  bankCode: config.sepay.bankCode || null,
  accountName: config.sepay.accountName || null,
});

/**
 * Sinh URL ảnh VietQR động của SePay (đã điền sẵn số tiền + nội dung CK).
 * @param {{accountNumber: string, bankCode: string}} account - tài khoản nhận tiền
 * @returns {string|null} null nếu chưa cấu hình tài khoản
 */
const buildSepayQrUrl = (account, amount, payCode) => {
  const { accountNumber, bankCode } = account || {};
  if (!accountNumber || !bankCode) return null;
  const params = new URLSearchParams({
    acc: accountNumber,
    bank: bankCode,
    amount: String(amount),
    des: payCode,
  });
  return `${config.sepay.qrImageBase}?${params.toString()}`;
};

module.exports = {
  PAY_CODE_PREFIX,
  buildPayCode,
  extractPayCode,
  resolveSepayAccount,
  buildSepayQrUrl,
};
