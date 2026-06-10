const { bearer, idParam, okData, okList, okMessage, err } = require('./_shared');

module.exports = {
  '/instructor-profiles': {
    get: { tags: ['InstructorProfiles'], summary: 'Danh sách hồ sơ giảng viên', security: bearer, responses: { 200: okList('InstructorProfile') } },
    post: { tags: ['InstructorProfiles'], summary: 'Tạo hồ sơ giảng viên', security: bearer, responses: { 201: okData('InstructorProfile', 'Đã tạo') } },
  },
  '/instructor-profiles/{id}': {
    get: { tags: ['InstructorProfiles'], summary: 'Chi tiết hồ sơ', security: bearer, parameters: [idParam], responses: { 200: okData('InstructorProfile'), 404: err('Không tìm thấy') } },
    patch: { tags: ['InstructorProfiles'], summary: 'Cập nhật hồ sơ', security: bearer, parameters: [idParam], responses: { 200: okData('InstructorProfile', 'Đã cập nhật'), 404: err('Không tìm thấy') } },
    delete: { tags: ['InstructorProfiles'], summary: 'Xóa hồ sơ (admin)', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
