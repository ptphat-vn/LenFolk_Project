const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/courses': {
    get: {
      tags: ['Courses'],
      summary: 'Danh sách khóa học (public). Mỗi item kèm `plan` (giá).',
      description: 'Public chỉ thấy course `published` và plan `isActive`. Admin/instructor thấy tất cả.',
      responses: { 200: okList('Course') },
    },
    post: {
      tags: ['Courses'],
      summary: 'Tạo khóa học (admin) — KHÔNG có giá',
      description: 'Đặt giá riêng qua `PUT /courses/{id}/plan`.',
      security: bearer,
      requestBody: jsonBody('CreateCourseInput'),
      responses: { 201: okData('Course', 'Đã tạo'), 403: err('Access denied') },
    },
  },
  '/courses/{id}': {
    get: {
      tags: ['Courses'],
      summary: 'Chi tiết khóa học (kèm `plan`)',
      description: 'Course không free yêu cầu Enrollment active (trừ admin/instructor).',
      parameters: [idParam],
      responses: { 200: okData('Course'), 403: err('Cần mua gói'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['Courses'],
      summary: 'Cập nhật khóa học (admin)',
      description: 'Đổi status published/archived sẽ tự bật/tắt `isActive` của CoursePlan.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('UpdateCourseInput'),
      responses: { 200: okData('Course', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Courses'],
      summary: 'Xóa khóa học (admin) — xóa luôn CoursePlan liên kết',
      security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
  '/courses/{id}/plan': {
    put: {
      tags: ['Courses'],
      summary: 'Tạo/cập nhật gói giá (CoursePlan) cho khóa học (admin)',
      description: 'Upsert. `isActive` tự bật nếu course đang published. Không áp dụng cho course free.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('UpsertCoursePlanInput'),
      responses: {
        200: okData('CoursePlan', 'Đã cập nhật gói'),
        400: err('Course free không đặt giá được'),
        404: err('Không tìm thấy course'),
      },
    },
  },
  '/courses/{id}/purchase': {
    post: {
      tags: ['Courses'],
      summary: 'Mua khóa học (user) — tạo đơn + nhận QR',
      description:
        'Lấy giá từ CoursePlan active. Tạo Enrollment(pending) + TransactionRecord(pending). ' +
        'Trả về `sepayQrUrl` (QR động đã điền sẵn số tiền + nội dung CK). Sau khi hiện QR, mobile poll `GET /transaction-records/{id}/status` tới khi `isPaid=true`.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('PurchaseInput', false),
      responses: {
        201: { description: 'Đã tạo đơn', content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseResponse' } } } },
        400: err('Course free / chưa published / chưa có QR / đã mua / đang chờ duyệt'),
        404: err('Không tìm thấy course'),
      },
    },
  },
};
