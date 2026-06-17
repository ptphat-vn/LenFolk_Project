const axios = require('axios');
const config = require('./index');
const logger = require('./logger');

/**
 * Gửi email qua Brevo (Sendinblue) HTTP API — https://www.brevo.com.
 * Dùng HTTPS cổng 443 nên KHÔNG bị Render chặn (khác SMTP 25/465/587).
 *
 * Ưu điểm: chỉ cần xác thực 1 ĐỊA CHỈ EMAIL người gửi (không cần sở hữu domain),
 * và gửi được cho BẤT KỲ người nhận nào. Free 300 email/ngày.
 *
 * Cấu hình qua biến môi trường:
 *   BREVO_API_KEY — API key của Brevo (Dashboard → SMTP & API → API Keys), dạng xkeysib-...
 *   MAIL_FROM     — người gửi, PHẢI là email đã verify trong Brevo
 *                   (Senders, Domains & Dedicated IPs → Senders). VD: LenFolk <ban@gmail.com>
 *   MAIL_REPLY_TO — (tuỳ chọn) hộp thư nhận phản hồi.
 */
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const isMailEnabled = Boolean(config.mail.brevoApiKey);

if (isMailEnabled) {
  logger.info('[Mailer] Brevo API đã sẵn sàng');
} else {
  logger.warn('[Mailer] BREVO_API_KEY chưa cấu hình — tính năng gửi email bị tắt.');
}

/** Tách "Tên <email@x.com>" → { name, email }. Nếu chỉ có email thì name bỏ trống. */
const parseAddress = (str = '') => {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(str);
  if (m) return { name: m[1] || undefined, email: m[2].trim() };
  return { email: str.trim() };
};

/**
 * Chuyển HTML → plain text đơn giản để làm phần textContent.
 * Email có cả html + text ít bị bộ lọc spam đánh dấu hơn.
 */
const htmlToText = (html = '') =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|tr|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Gửi 1 email. KHÔNG bao giờ ném lỗi ra ngoài để không làm hỏng request chính
 * (đăng ký / thanh toán...). Trả về true nếu gửi thành công.
 * @param {{ to: string, subject: string, html: string, text?: string,
 *           replyTo?: string }} opts
 */
const sendMail = async ({ to, subject, html, text, replyTo }) => {
  if (!isMailEnabled) {
    logger.warn(
      `[Mailer] Bỏ qua gửi mail "${subject}" → ${to} (BREVO_API_KEY chưa cấu hình)`,
    );
    return false;
  }

  const reply = replyTo || config.mail.replyTo;

  const payload = {
    sender: parseAddress(config.mail.from),
    to: [{ email: to }],
    subject,
    htmlContent: html,
    // Luôn kèm bản text → tốt cho deliverability
    textContent: text || htmlToText(html),
    ...(reply ? { replyTo: parseAddress(reply) } : {}),
  };

  try {
    await axios.post(BREVO_ENDPOINT, payload, {
      headers: {
        'api-key': config.mail.brevoApiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      timeout: 15000,
    });
    logger.info(`[Mailer] Đã gửi "${subject}" → ${to}`);
    return true;
  } catch (err) {
    // Brevo trả lỗi chi tiết trong response body — log ra để dễ chẩn đoán
    const detail = err.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message;
    logger.error(`[Mailer] Gửi "${subject}" → ${to} thất bại — ${detail}`);
    return false;
  }
};

module.exports = { sendMail, isMailEnabled };
