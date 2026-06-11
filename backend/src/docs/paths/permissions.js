const { bearer, idParam, okData, okList, okMessage, err } = require('./_shared');

module.exports = {
  '/permissions': {
    get: { tags: ['Permissions'], summary: 'Danh sách quyền (admin)', security: bearer, responses: { 200: okList('Permission') } },
    post: { tags: ['Permissions'], summary: 'Tạo quyền (admin)', security: bearer, responses: { 201: okData('Permission', 'Đã tạo') } },
  },
  '/permissions/{id}': {
    get: { tags: ['Permissions'], summary: 'Chi tiết quyền (admin)', security: bearer, parameters: [idParam], responses: { 200: okData('Permission'), 404: err('Không tìm thấy') } },
    patch: { tags: ['Permissions'], summary: 'Cập nhật quyền (admin)', security: bearer, parameters: [idParam], responses: { 200: okData('Permission', 'Đã cập nhật'), 404: err('Không tìm thấy') } },
    delete: { tags: ['Permissions'], summary: 'Xóa quyền (admin)', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
