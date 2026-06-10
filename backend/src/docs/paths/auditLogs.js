const { bearer, idParam, okData, okList, okMessage, err } = require('./_shared');

module.exports = {
  '/audit-logs': {
    get: {
      tags: ['AuditLogs'],
      summary: 'Nhật ký hệ thống (admin) — populate actor, kèm before/after',
      security: bearer,
      responses: { 200: okList('AuditLog') },
    },
    post: { tags: ['AuditLogs'], summary: 'Tạo bản ghi nhật ký thủ công (admin)', security: bearer, responses: { 201: okData('AuditLog', 'Đã tạo') } },
  },
  '/audit-logs/{id}': {
    get: { tags: ['AuditLogs'], summary: 'Chi tiết nhật ký (admin)', security: bearer, parameters: [idParam], responses: { 200: okData('AuditLog'), 404: err('Không tìm thấy') } },
    delete: { tags: ['AuditLogs'], summary: 'Xóa bản ghi nhật ký (admin)', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
