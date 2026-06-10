const { bearer, idParam, okData, okList, okMessage, err, jsonBody, formBody } = require('./_shared');

module.exports = {
  '/users': {
    get: {
      tags: ['Users'], summary: 'Danh sách người dùng (admin)', security: bearer,
      responses: { 200: okList('User'), 403: err('Access denied') },
    },
    post: {
      tags: ['Users'], summary: 'Tạo người dùng (admin)', security: bearer,
      requestBody: jsonBody('CreateUserInput'),
      responses: { 201: okData('User', 'Đã tạo'), 403: err('Access denied') },
    },
  },
  '/users/{id}': {
    get: {
      tags: ['Users'], summary: 'Chi tiết người dùng (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okData('User'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['Users'], summary: 'Cập nhật người dùng (admin) — multipart nếu đổi avatar', security: bearer,
      parameters: [idParam],
      requestBody: formBody('UpdateUserInput'),
      responses: { 200: okData('User', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Users'], summary: 'Xóa mềm người dùng (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
};
