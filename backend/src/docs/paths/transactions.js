const { bearer, idParam, okData, okList, okMessage, err } = require('./_shared');

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
  '/transaction-records/{id}/status': {
    get: {
      tags: ['TransactionRecords'],
      summary: 'Poll trạng thái thanh toán (mobile, sau khi hiện QR SePay)',
      description:
        'Mobile gọi định kỳ sau khi hiện QR để biết SePay đã xác nhận chưa. ' +
        '`isPaid=true` khi `status` đã chuyển sang `success` (webhook SePay đã khớp & kích hoạt quyền truy cập).',
      security: bearer,
      parameters: [idParam],
      responses: {
        200: {
          description: 'Trạng thái giao dịch',
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  transactionId: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'success', 'failed', 'refunded'], example: 'pending' },
                  isPaid: { type: 'boolean', example: false },
                  amount: { type: 'number', example: 199000 },
                  currency: { type: 'string', example: 'VND' },
                  payCode: { type: 'string', example: 'LF1A2B3C4D' },
                  paidAt: { type: 'string', format: 'date-time', nullable: true },
                  transactionType: { type: 'string', example: 'course' },
                },
              },
            },
          } } },
        },
        403: err('Không phải của bạn'),
        404: err('Không tìm thấy'),
      },
    },
  },
  '/transaction-records/{id}/cancel': {
    patch: {
      tags: ['TransactionRecords'],
      summary: 'User tự hủy yêu cầu thanh toán đang chờ',
      description:
        'Cho user hủy đơn khi đóng màn QR / bấm "Hủy" hoặc "Xóa" mà **chưa chuyển khoản**. ' +
        'Chỉ hủy được đơn còn `pending`; đơn `success`/`reviewing` sẽ trả `400`. ' +
        'Khi hủy: giao dịch → `failed` (lý do "Cancelled by user"), Enrollment liên quan → `cancelled`.',
      security: bearer,
      parameters: [idParam],
      responses: {
        200: okMessage('Đã hủy yêu cầu thanh toán'),
        400: err('Không thể hủy đơn ở trạng thái hiện tại'),
        403: err('Không phải của bạn'),
        404: err('Không tìm thấy'),
      },
    },
  },
};
