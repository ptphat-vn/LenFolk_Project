const { bearer, idParam, okData, okList, okMessage, err, jsonBody } = require('./_shared');

module.exports = {
  '/practice-sessions': {
    get: { tags: ['PracticeSessions'], summary: 'Phiên luyện tập của tôi', security: bearer, responses: { 200: okList('PracticeSession') } },
    post: { tags: ['PracticeSessions'], summary: 'Tạo phiên luyện tập', security: bearer, requestBody: jsonBody('PracticeSession', false), responses: { 201: okData('PracticeSession', 'Đã tạo') } },
  },
  '/practice-sessions/{id}': {
    get: { tags: ['PracticeSessions'], summary: 'Chi tiết phiên', security: bearer, parameters: [idParam], responses: { 200: okData('PracticeSession'), 404: err('Không tìm thấy') } },
    patch: { tags: ['PracticeSessions'], summary: 'Cập nhật phiên', security: bearer, parameters: [idParam], responses: { 200: okData('PracticeSession', 'Đã cập nhật'), 404: err('Không tìm thấy') } },
    delete: { tags: ['PracticeSessions'], summary: 'Xóa phiên', security: bearer, parameters: [idParam], responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') } },
  },
};
