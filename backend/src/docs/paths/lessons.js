const { bearer, idParam, okData, okList, okMessage, err, formBody } = require('./_shared');

module.exports = {
  '/lessons': {
    get: {
      tags: ['Lessons'], summary: 'Danh sách bài học (public chỉ thấy published)',
      responses: { 200: okList('Lesson') },
    },
    post: {
      tags: ['Lessons'], summary: 'Tạo bài học (instructor sở hữu course / admin) — multipart video',
      security: bearer,
      requestBody: formBody('CreateLessonInput'),
      responses: { 201: okData('Lesson', 'Đã tạo'), 403: err('Không có quyền'), 404: err('Không tìm thấy course') },
    },
  },
  '/lessons/{id}': {
    get: {
      tags: ['Lessons'], summary: 'Chi tiết bài học',
      description: 'Bài thuộc course không free cần Enrollment active (trừ admin/instructor).',
      parameters: [idParam],
      responses: { 200: okData('Lesson'), 401: err('Cần đăng nhập'), 403: err('Cần mua gói'), 404: err('Không tìm thấy') },
    },
    patch: {
      tags: ['Lessons'], summary: 'Cập nhật bài học (instructor/admin) — multipart video', security: bearer,
      parameters: [idParam],
      requestBody: formBody('UpdateLessonInput'),
      responses: { 200: okData('Lesson', 'Đã cập nhật'), 404: err('Không tìm thấy') },
    },
    delete: {
      tags: ['Lessons'], summary: 'Xóa bài học (admin)', security: bearer,
      parameters: [idParam],
      responses: { 200: okMessage('Đã xóa'), 404: err('Không tìm thấy') },
    },
  },
};
