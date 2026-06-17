const axios = require('axios');
const config = require('./index');
const logger = require('./logger');

/**
 * Gửi email qua Resend HTTP API (https://resend.com).
 * Dùng HTTPS cổng 443 nên KHÔNG bị các nền tảng như Render chặn (khác với SMTP 25/465/587).
 *
 * Cấu hình qua biến môi trường:
 *   RESEND_API_KEY — API key của Resend (Dashboard → API Keys)
 *   MAIL_FROM      — địa chỉ gửi; PHẢI thuộc domain đã verify trên Resend (SPF/DKIM)
 *                    để email không vào spam. Khi test có thể dùng "onboarding@resend.dev".
 *   MAIL_REPLY_TO  — (tuỳ chọn) hộp thư nhận phản hồi, vd support@domain.
 *
 * Nếu chưa cấu hình RESEND_API_KEY → bỏ qua gửi mail (app vẫn chạy bình thường).
 */
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const isMailEnabled = Boolean(config.mail.resendApiKey);

if (isMailEnabled) {
  logger.info('[Mailer] Resend API đã sẵn sàng');
} else {
  logger.warn('[Mailer] RESEND_API_KEY chưa cấu hình — tính năng gửi email bị tắt.');
}

/**
 * Chuyển HTML → plain text đơn giản để làm phần text/plain.
 * Email có CẢ html + text (multipart/alternative) ít bị bộ lọc spam đánh dấu
 * hơn so với email chỉ có HTML (luật MIME_HTML_ONLY của SpamAssassin).
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
 *           replyTo?: string, headers?: object, tags?: Array }} opts
 */
const sendMail = async ({ to, subject, html, text, replyTo, headers, tags }) => {
  if (!isMailEnabled) {
    logger.warn(
      `[Mailer] Bỏ qua gửi mail "${subject}" → ${to} (RESEND_API_KEY chưa cấu hình)`,
    );
    return false;
  }

  const reply = replyTo || config.mail.replyTo || undefined;

  const payload = {
    from: config.mail.from,
    to: [to],
    subject,
    html,
    // Luôn kèm bản text/plain (tự suy ra từ HTML nếu không truyền) → tốt cho deliverability
    text: text || htmlToText(html),
    ...(reply ? { reply_to: reply } : {}),
    ...(headers ? { headers } : {}),
    ...(tags ? { tags } : {}),
  };

  try {
    await axios.post(RESEND_ENDPOINT, payload, {
      headers: {
        Authorization: `Bearer ${config.mail.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    logger.info(`[Mailer] Đã gửi "${subject}" → ${to}`);
    return true;
  } catch (err) {
    // Resend trả lỗi chi tiết trong response body — log ra để dễ chẩn đoán
    const detail = err.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message;
    logger.error(`[Mailer] Gửi "${subject}" → ${to} thất bại — ${detail}`);
    return false;
  }
};

module.exports = { sendMail, isMailEnabled };
