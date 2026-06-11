const { bearer, idParam, okData, okList, okMessage, err, jsonBody, formBody } = require('./_shared');

module.exports = {
  '/performances': {
    get: {
      tags: ['Performances'], summary: 'Danh sách tiết mục (public chỉ thấy published). Giá nằm trong field `price`.',
      responses: { 200: okList('Performance') },
    },
    post: {
      tags: ['Performances'],
      summary: 'Tạo tiết mục (instructor/admin) kèm GIÁ — multipart nếu có documents',
      description: 'Instructor luôn tạo ở status `pending`, chờ admin duyệt. Giá nhập thẳng vào `price`.',
      security: bearer,
      requestBody: formBody('CreatePerformanceInput'),
      responses: { 201: okData('Performance', 'Đã gửi, chờ duyệt'), 403: err('Không có quyền') },
    },
  },
  '/performances/{id}': {
    get: {
      tags: ['Performances'], summary: 'Chi tiết tiết mục',
      description: 'Tiết mục không free cần Enrollment active (trừ admin/instructor).',
      parameters: [idParam],
      responses: { 200: okData('Performance'), 401: err('Cần đăng nhập'), 403: err('Cần mua'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['Performances'], summary: 'Cập nhật tiết mục (instructor của mình / admin)',
      description: 'Instructor không được đổi status (bị bỏ qua). multipart nếu thêm documents.',
      security: bearer,
      parameters: [idParam],
      requestBody: formBody('UpdatePerformanceInput'),
      responses: { 200: okData('Performance', 'Đã cập nhật'), 403: err('Không có quyền'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Performances'], summary: 'Xóa tiết mục (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
  '/performances/{id}/approve': {
    patch: {
      tags: ['Performances'], summary: 'Admin duyệt tiết mục (pending → published)',
      description: 'Set publishedAt và (tùy chọn) adminCommissionPercentage.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('ApprovePerformanceInput', false),
      responses: { 200: okData('Performance', 'Đã duyệt'), 400: err('Chỉ duyệt được tiết mục pending'), 404: err('Không tìm thấy') },
    },
  },
  '/performances/{id}/reject': {
    patch: {
      tags: ['Performances'], summary: 'Admin từ chối tiết mục (pending → archived)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('RejectPerformanceInput', false),
      responses: { 200: okData('Performance', 'Đã từ chối'), 400: err('Chỉ từ chối được tiết mục pending'), 404: err('Không tìm thấy') },
    },
  },
  '/performances/{id}/purchase': {
    post: {
      tags: ['Performances'],
      summary: 'Mua tiết mục (user) — mua đứt, tạo đơn + nhận QR',
      description:
        'Lấy giá từ `performance.price`. Tạo Enrollment(pending, endDate=null) + TransactionRecord(pending). ' +
        'Trả về QR cố định + số tiền (đã trừ coupon).',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('PurchaseInput', false),
      responses: {
        201: { description: 'Đã tạo đơn', content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseResponse' } } } },
        400: err('Free / chưa published / chưa có giá / chưa có QR / đã mua / đang chờ duyệt'),
        404: err('Không tìm thấy tiết mục'),
      },
    },
  },
};
