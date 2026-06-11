const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/badges': {
    get: { tags: ['Badges'], summary: 'Danh sách huy hiệu (public)', responses: { 200: okList('Badge') } },
    post: {
      tags: ['Badges'], summary: 'Tạo huy hiệu (admin)', security: bearer,
      requestBody: jsonBody('BadgeInput'), responses: { 201: okData('Badge', 'Đã tạo') },
    },
  },
  '/badges/{id}': {
    get: { tags: ['Badges'], summary: 'Chi tiết huy hiệu', parameters: [idParam], responses: { 200: okData('Badge'), 404: err('Không tìm thấy') } },
    patch: {
      tags: ['Badges'], summary: 'Cập nhật huy hiệu (admin)', security: bearer,
      parameters: [idParam], requestBody: jsonBody('BadgeInput', false),
      responses: { 200: okData('Badge', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Badges'], summary: 'Xóa huy hiệu (admin)', security: bearer,
      parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
};
