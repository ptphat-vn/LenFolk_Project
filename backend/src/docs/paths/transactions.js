const { bearer, idParam, okData, okList, okMessage, err } = require('./_shared');

const proofBody = {
  required: true,
  content: { 'multipart/form-data': { schema: {
    type: 'object', required: ['proof'],
    properties: { proof: { type: 'string', format: 'binary', description: 'Ảnh minh chứng chuyển khoản' } },
  } } },
};

const rejectBody = {
  required: false,
  content: { 'application/json': { schema: {
    type: 'object', properties: { rejectReason: { type: 'string', example: 'Số tiền không khớp' } },
  } } },
};

module.exports = {
  '/transaction-records': {
    get: {
      tags: ['TransactionRecords'],
      summary: 'Danh sách giao dịch (admin xem tất cả, user chỉ xem của mình)',
      security: bearer,
      responses: { 200: okList('TransactionRecord') },
    },
    post: {
      tags: ['TransactionRecords'],
      summary: 'Bị chặn — giao dịch chỉ tạo qua luồng mua',
      security: bearer,
      responses: { 403: err('Chỉ tạo qua /courses|performances/{id}/purchase') },
    },
  },
  '/transaction-records/{id}': {
    get: {
      tags: ['TransactionRecords'], summary: 'Chi tiết giao dịch (chủ sở hữu / admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okData('TransactionRecord'), 403: err('Không phải của bạn'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['TransactionRecords'], summary: 'Cập nhật giao dịch (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okData('TransactionRecord', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['TransactionRecords'], summary: 'Xóa giao dịch (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
  '/transaction-records/{id}/upload-proof': {
    patch: {
      tags: ['TransactionRecords'],
      summary: 'Upload minh chứng chuyển khoản (user) — pending → reviewing',
      security: bearer,
      parameters: [idParam],
      requestBody: proofBody,
      responses: {
        200: okMessage('Đã upload, chờ admin duyệt'),
        400: err('Thiếu ảnh / sai trạng thái'),
        403: err('Không phải của bạn'), 404: err('Không tìm thấy'),
      },
    },
  },
  '/transaction-records/{id}/approve': {
    patch: {
      tags: ['TransactionRecords'],
      summary: 'Admin duyệt thanh toán — reviewing → success',
      description:
        'Enrollment → active + isPaid; course set endDate theo chu kỳ, performance endDate=null (mua đứt). ' +
        'Cộng ví instructor `amount*(100-commission)/100`, set `User.isSubscribed=true`, tăng usedCount coupon, ghi AuditLog.',
      security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã duyệt'), 400: err('Chỉ duyệt được giao dịch reviewing'), 404: err('Không tìm thấy') },
    },
  },
  '/transaction-records/{id}/reject': {
    patch: {
      tags: ['TransactionRecords'],
      summary: 'Admin từ chối thanh toán — reviewing → failed',
      description: 'Enrollment → cancelled. Ghi AuditLog.',
      security: bearer,
      parameters: [idParam],
      requestBody: rejectBody,
      responses: { 200: okMessage('Đã từ chối'), 400: err('Chỉ từ chối được giao dịch reviewing'), 404: err('Không tìm thấy') },
    },
  },
};
