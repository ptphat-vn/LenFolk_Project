const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/progress': {
    get: { tags: ['Progress'], summary: 'Tiến độ học của tôi', security: bearer, responses: { 200: okList('Progress') } },
    post: { tags: ['Progress'], summary: 'Tạo bản ghi tiến độ', security: bearer, requestBody: jsonBody('Progress', false), responses: { 201: okData('Progress', 'Đã tạo') } },
  },
  '/progress/{id}': {
    get: { tags: ['Progress'], summary: 'Chi tiết tiến độ', security: bearer, parameters: [idParam], responses: { 200: okData('Progress'), 404: err('Không tìm thấy') } },
    patch: { tags: ['Progress'], summary: 'Cập nhật tiến độ', security: bearer, parameters: [idParam], responses: { 200: okData('Progress', 'Đã cập nhật'), 404: err('Không tìm thấy') } },
    delete: { tags: ['Progress'], summary: 'Xóa tiến độ', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
