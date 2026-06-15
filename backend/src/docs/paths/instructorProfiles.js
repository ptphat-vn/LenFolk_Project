const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/instructor-profiles': {
    get: { tags: ['InstructorProfiles'], summary: 'Danh sách hồ sơ giảng viên (lọc ?status=pending để xem đơn chờ duyệt)', security: bearer, responses: { 200: okList('InstructorProfile') } },
    post: { tags: ['InstructorProfiles'], summary: 'Tạo hồ sơ giảng viên', security: bearer, responses: { 201: okData('InstructorProfile', 'Đã tạo') } },
  },
  '/instructor-profiles/{id}/approve': {
    patch: {
      tags: ['InstructorProfiles'],
      summary: 'Admin duyệt đơn giảng viên (pending → approved)',
      description: 'Sau khi duyệt: user có role instructor, đăng nhập được và đăng tiết mục được. Gửi email thông báo.',
      security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã duyệt'), 400: err('Đã duyệt rồi'), 404: err('Không tìm thấy hồ sơ') },
    },
  },
  '/instructor-profiles/{id}/reject': {
    patch: {
      tags: ['InstructorProfiles'],
      summary: 'Admin từ chối đơn giảng viên (→ rejected)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody('RejectInstructorInput', false),
      responses: { 200: okMessage('Đã từ chối'), 400: err('Hồ sơ đã duyệt'), 404: err('Không tìm thấy hồ sơ') },
    },
  },
  '/instructor-profiles/{id}': {
    get: { tags: ['InstructorProfiles'], summary: 'Chi tiết hồ sơ', security: bearer, parameters: [idParam], responses: { 200: okData('InstructorProfile'), 404: err('Không tìm thấy') } },
    patch: { tags: ['InstructorProfiles'], summary: 'Cập nhật hồ sơ', security: bearer, parameters: [idParam], responses: { 200: okData('InstructorProfile', 'Đã cập nhật'), 404: err('Không tìm thấy') } },
    delete: { tags: ['InstructorProfiles'], summary: 'Xóa hồ sơ (admin)', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
