const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/streaks': {
    get: { tags: ['Streaks'], summary: 'Chuỗi ngày luyện tập của tôi', security: bearer, responses: { 200: okList('Streak') } },
    post: {
      tags: ['Streaks'], summary: 'Tạo bản ghi streak (tự trao badge nếu đạt ngưỡng)', security: bearer,
      requestBody: jsonBody('Streak', false), responses: { 201: okData('Streak', 'Đã tạo') },
    },
  },
  '/streaks/{id}': {
    get: { tags: ['Streaks'], summary: 'Chi tiết streak', security: bearer, parameters: [idParam], responses: { 200: okData('Streak'), 404: err('Không tìm thấy') } },
    patch: {
      tags: ['Streaks'], summary: 'Cập nhật streak (tự trao badge nếu đạt ngưỡng)', security: bearer,
      parameters: [idParam], responses: { 200: okData('Streak', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: { tags: ['Streaks'], summary: 'Xóa streak', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
