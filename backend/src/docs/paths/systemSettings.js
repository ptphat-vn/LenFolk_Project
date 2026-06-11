const { bearer, okData, err, formBody } = require('./_shared');

module.exports = {
  '/system-settings': {
    get: {
      tags: ['SystemSettings'],
      summary: 'Lấy cấu hình thanh toán dùng chung (QR + bank) — public',
      responses: { 200: okData('SystemSetting') },
    },
    put: {
      tags: ['SystemSettings'],
      summary: 'Cập nhật QR + thông tin ngân hàng (admin) — multipart, field `qrCode`',
      description: 'Đây là nơi admin upload **1 mã QR cố định** dùng cho mọi đơn thanh toán.',
      security: bearer,
      requestBody: formBody('UpdateSystemSettingInput'),
      responses: { 200: okData('SystemSetting', 'Đã cập nhật'), 403: err('Access denied') },
    },
  },
};
