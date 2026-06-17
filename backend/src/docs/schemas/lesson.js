// Lesson schema
module.exports = {
  Lesson: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4f0' },
      courseId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
      title: { type: 'string', example: 'Bài 1: Làm quen với đàn' },
      description: { type: 'string', nullable: true },
      videoUrl: { type: 'string', nullable: true },
      pdfUrl: { type: 'string', nullable: true },
      imageUrls: { type: 'array', items: { type: 'string' } },
      order: { type: 'integer', example: 1 },
      duration: { type: 'number', nullable: true },
      status: { type: 'string', enum: ['draft', 'published', 'archived'], example: 'published' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateLessonInput: {
    type: 'object',
    required: ['courseId', 'title'],
    description: 'multipart/form-data nếu kèm video (field video), PDF (field pdf) hoặc nhiều ảnh (field images)',
    properties: {
      courseId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
      title: { type: 'string', example: 'Bài 1: Làm quen với đàn' },
      description: { type: 'string' },
      order: { type: 'integer', example: 1 },
      duration: { type: 'number' },
      status: { type: 'string', enum: ['draft', 'published', 'archived'] },
      video: { type: 'string', format: 'binary', description: 'File video bài học' },
      audio: { type: 'string', format: 'binary', description: 'File audio bài học' },
      pdf: { type: 'string', format: 'binary', description: 'File PDF tài liệu bài học' },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'Nhiều ảnh minh hoạ bài học',
      },
    },
  },
  UpdateLessonInput: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      order: { type: 'integer' },
      duration: { type: 'number' },
      status: { type: 'string', enum: ['draft', 'published', 'archived'] },
      video: { type: 'string', format: 'binary' },
      audio: { type: 'string', format: 'binary', description: 'File audio bài học' },
      pdf: { type: 'string', format: 'binary', description: 'File PDF tài liệu bài học' },
      images: {
        type: 'array',
        items: { type: 'string', format: 'binary' },
        description: 'Nhiều ảnh minh hoạ bài học (thêm vào danh sách hiện có)',
      },
    },
  },
};
