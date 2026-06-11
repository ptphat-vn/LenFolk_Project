const { bearer, okList } = require('./_shared');

module.exports = {
  '/enrollments/me': {
    get: {
      tags: ['Enrollments'],
      summary: 'User xem mình đã đăng ký course/tiết mục gì',
      description: 'Mặc định chỉ trả enrollment active & đã thanh toán. Thêm `?all=true` để xem cả pending/cancelled. Mỗi item kèm `itemType` + thông tin item (title, thumbnail).',
      security: bearer,
      parameters: [
        { name: 'all', in: 'query', required: false, schema: { type: 'boolean' }, description: 'true = lấy tất cả trạng thái' },
      ],
      responses: { 200: okList('Enrollment') },
    },
  },
  '/enrollments': {
    get: {
      tags: ['Enrollments'],
      summary: 'Admin xem tất cả enrollment (lọc ?userId, ?itemType, ?status)',
      security: bearer,
      parameters: [
        { name: 'userId', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'itemType', in: 'query', required: false, schema: { type: 'string', enum: ['course', 'performance'] } },
        { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['pending', 'active', 'expired', 'cancelled'] } },
      ],
      responses: { 200: okList('Enrollment') },
    },
  },
};
