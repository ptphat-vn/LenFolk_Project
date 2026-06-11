const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/notifications': {
    get: { tags: ['Notifications'], summary: 'Thông báo của tôi', security: bearer, responses: { 200: okList('Notification') } },
    post: {
      tags: ['Notifications'], summary: 'Tạo thông báo (admin)', security: bearer,
      requestBody: jsonBody('NotificationInput'), responses: { 201: okData('Notification', 'Đã tạo') },
    },
  },
  '/notifications/{id}': {
    get: { tags: ['Notifications'], summary: 'Chi tiết thông báo', security: bearer, parameters: [idParam], responses: { 200: okData('Notification'), 404: err('Không tìm thấy') } },
    patch: {
      tags: ['Notifications'], summary: 'Cập nhật (vd đánh dấu đã đọc)', security: bearer,
      parameters: [idParam], responses: { 200: okData('Notification', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: { tags: ['Notifications'], summary: 'Xóa thông báo (admin)', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
