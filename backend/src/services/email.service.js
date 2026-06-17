const { sendMail } = require('../config/mailer');
const config = require('../config');

const APP = config.appName;
const BRAND = '#2d6a4f';
const BRAND_SOFT = '#e7f3ec'; // nền xanh nhạt cho hộp mã OTP

// Khung HTML dùng chung cho mọi email.
const layout = (title, bodyHtml) => `
  <div style="background:#f4f4f7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
      <div style="background:${BRAND};padding:20px 28px;">
        <h1 style="margin:0;color:#fff;font-size:20px;">${APP}</h1>
      </div>
      <div style="padding:28px;color:#333;line-height:1.6;">
        <h2 style="margin-top:0;font-size:18px;color:#111;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px;text-align:center;">
        © ${APP}. Email tự động, vui lòng không trả lời.
      </div>
    </div>
  </div>`;

const formatVnd = (amount, currency = 'VND') =>
  currency === 'VND' ? `${Number(amount).toLocaleString('vi-VN')}đ` : `${amount} ${currency}`;

/**
 * Email xác thực tài khoản bằng mã OTP.
 */
const sendVerificationEmail = (user, code) => {
  const html = layout(
    'Xác thực địa chỉ email',
    `<p>Chào <b>${user.name}</b>,</p>
     <p>Cảm ơn bạn đã đăng ký ${APP}. Nhập mã xác thực dưới đây để kích hoạt tài khoản:</p>
     <div style="text-align:center;margin:24px 0;">
       <span style="display:inline-block;font-size:32px;letter-spacing:8px;font-weight:bold;
         color:${BRAND};background:${BRAND_SOFT};padding:14px 24px;border-radius:10px;">${code}</span>
     </div>
     <p style="color:#666;">Mã có hiệu lực trong <b>10 phút</b>. Nếu bạn không đăng ký, hãy bỏ qua email này.</p>`,
  );
  return sendMail({ to: user.email, subject: `[${APP}] Mã xác thực tài khoản: ${code}`, html });
};

/**
 * Email gửi mã OTP đặt lại mật khẩu.
 */
const sendPasswordResetEmail = (user, code) => {
  const html = layout(
    'Đặt lại mật khẩu',
    `<p>Chào <b>${user.name}</b>,</p>
     <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhập mã dưới đây để tiếp tục:</p>
     <div style="text-align:center;margin:24px 0;">
       <span style="display:inline-block;font-size:32px;letter-spacing:8px;font-weight:bold;
         color:${BRAND};background:${BRAND_SOFT};padding:14px 24px;border-radius:10px;">${code}</span>
     </div>
     <p style="color:#666;">Mã có hiệu lực trong <b>10 phút</b>. Nếu bạn không yêu cầu, hãy bỏ qua email này —
        mật khẩu của bạn vẫn an toàn.</p>`,
  );
  return sendMail({ to: user.email, subject: `[${APP}] Mã đặt lại mật khẩu: ${code}`, html });
};

/**
 * Email báo thanh toán thành công.
 * @param {object} info { itemName, amount, currency, transactionType, transactionId }
 */
const sendPaymentSuccessEmail = (user, info) => {
  const typeLabel = info.transactionType === 'course' ? 'Khóa học' : 'Tiết mục';
  const html = layout(
    'Thanh toán thành công 🎉',
    `<p>Chào <b>${user.name}</b>,</p>
     <p>Chúng tôi đã nhận được thanh toán của bạn. Quyền truy cập đã được kích hoạt!</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
       <tr><td style="padding:8px 0;color:#666;">${typeLabel}</td>
           <td style="padding:8px 0;text-align:right;font-weight:bold;">${info.itemName || '-'}</td></tr>
       <tr><td style="padding:8px 0;color:#666;">Số tiền</td>
           <td style="padding:8px 0;text-align:right;font-weight:bold;">${formatVnd(info.amount, info.currency)}</td></tr>
       <tr><td style="padding:8px 0;color:#666;">Mã giao dịch</td>
           <td style="padding:8px 0;text-align:right;font-family:monospace;">${info.transactionId}</td></tr>
     </table>
     <p>Bạn có thể bắt đầu học ngay trên ${APP}. Chúc bạn học vui!</p>`,
  );
  return sendMail({ to: user.email, subject: `[${APP}] Thanh toán thành công`, html });
};

/**
 * Email báo đơn đăng ký giảng viên ĐƯỢC DUYỆT.
 */
const sendInstructorApprovedEmail = (user) => {
  const loginUrl = `${config.clientUrl}/login`;
  const html = layout(
    'Đơn đăng ký giảng viên đã được duyệt 🎉',
    `<p>Chào <b>${user.name}</b>,</p>
     <p>Chúc mừng! Đơn đăng ký giảng viên của bạn đã được duyệt. Bạn có thể đăng nhập và bắt đầu đăng tiết mục ngay.</p>
     <div style="text-align:center;margin:24px 0;">
       <a href="${loginUrl}" style="display:inline-block;background:${BRAND};color:#fff;
         text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;">Đăng nhập ngay</a>
     </div>`,
  );
  return sendMail({ to: user.email, subject: `[${APP}] Đơn giảng viên đã được duyệt`, html });
};

/**
 * Email báo đơn đăng ký giảng viên BỊ TỪ CHỐI.
 */
const sendInstructorRejectedEmail = (user, reason) => {
  const html = layout(
    'Đơn đăng ký giảng viên chưa được duyệt',
    `<p>Chào <b>${user.name}</b>,</p>
     <p>Rất tiếc, đơn đăng ký giảng viên của bạn chưa được duyệt lần này.</p>
     ${reason ? `<p style="background:#fef2f2;border-left:3px solid #ef4444;padding:10px 14px;color:#991b1b;">
        <b>Lý do:</b> ${reason}</p>` : ''}
     <p style="color:#666;">Bạn có thể liên hệ đội ngũ ${APP} để biết thêm chi tiết.</p>`,
  );
  return sendMail({ to: user.email, subject: `[${APP}] Đơn giảng viên chưa được duyệt`, html });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentSuccessEmail,
  sendInstructorApprovedEmail,
  sendInstructorRejectedEmail,
};
