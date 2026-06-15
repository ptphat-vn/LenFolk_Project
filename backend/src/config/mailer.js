const nodemailer = require('nodemailer');
const config = require('./index');
const logger = require('./logger');

/**
 * Transporter Nodemailer (SMTP). Cấu hình qua biến môi trường MAIL_*.
 * Nếu chưa cấu hình (MAIL_HOST/USER trống) → transporter = null, hệ thống vẫn chạy
 * bình thường, chỉ bỏ qua việc gửi mail (log cảnh báo). Tránh làm sập app khi dev.
 */
let transporter = null;

const isMailEnabled = Boolean(config.mail.host && config.mail.user);

if (isMailEnabled) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure, // true cho cổng 465, false cho 587/STARTTLS
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });

  transporter.verify((err) => {
    if (err) logger.error('[Mailer] SMTP connection failed', err);
    else logger.info('[Mailer] SMTP ready');
  });
} else {
  logger.warn('[Mailer] MAIL_* chưa cấu hình — tính năng gửi email bị tắt.');
}

/**
 * Gửi 1 email. KHÔNG bao giờ ném lỗi ra ngoài để không làm hỏng request chính
 * (đăng ký / thanh toán...). Trả về true nếu gửi thành công.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.warn(`[Mailer] Bỏ qua gửi mail "${subject}" → ${to} (SMTP chưa cấu hình)`);
    return false;
  }
  try {
    await transporter.sendMail({ from: config.mail.from, to, subject, html, text });
    logger.info(`[Mailer] Đã gửi "${subject}" → ${to}`);
    return true;
  } catch (err) {
    logger.error(`[Mailer] Gửi "${subject}" → ${to} thất bại`, err);
    return false;
  }
};

module.exports = { sendMail, isMailEnabled };
