const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/wallets/me': {
    get: {
      tags: ['Wallets'],
      summary: 'Ví của instructor + lịch sử rút tiền',
      security: bearer,
      responses: {
        200: { description: 'Ví + payouts', content: { 'application/json': { schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object', properties: {
              wallet: { $ref: '#/components/schemas/Wallet' },
              payouts: { type: 'array', items: { $ref: '#/components/schemas/PayoutRequest' } },
            } },
          },
        } } } },
        403: err('Chỉ instructor/admin'),
      },
    },
  },
  '/wallets/bank-info': {
    put: {
      tags: ['Wallets'],
      summary: 'Cập nhật thông tin ngân hàng (lưu vào InstructorProfile)',
      security: bearer,
      requestBody: jsonBody('BankInfoInput'),
      responses: { 200: okMessage('Đã cập nhật'), 403: err('Chỉ instructor/admin') },
    },
  },
  '/wallets/payout': {
    post: {
      tags: ['Wallets'],
      summary: 'Tạo yêu cầu rút tiền (tối thiểu 100k) — trừ ngay balance',
      security: bearer,
      requestBody: jsonBody('PayoutInput'),
      responses: {
        201: okData('PayoutRequest', 'Đã tạo yêu cầu'),
        400: err('Dưới mức tối thiểu / thiếu bank info / đang có yêu cầu pending'),
      },
    },
  },
  '/wallets/admin/payouts': {
    get: {
      tags: ['Wallets'], summary: 'Danh sách yêu cầu rút tiền (admin)', security: bearer,
      responses: { 200: okList('PayoutRequest') },
    },
  },
  '/wallets/admin/payouts/{id}': {
    patch: {
      tags: ['Wallets'],
      summary: 'Duyệt/từ chối yêu cầu rút tiền (admin)',
      description: 'Reject sẽ hoàn tiền về balance.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('ProcessPayoutInput'),
      responses: { 200: okData('PayoutRequest', 'Đã xử lý'), 400: err('Trạng thái không hợp lệ'), 404: err('Không tìm thấy') },
    },
  },
};
