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
    description: 'multipart/form-data nếu kèm video (field videoFile)',
    properties: {
      courseId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
      title: { type: 'string', example: 'Bài 1: Làm quen với đàn' },
      description: { type: 'string' },
      order: { type: 'integer', example: 1 },
      duration: { type: 'number' },
      status: { type: 'string', enum: ['draft', 'published', 'archived'] },
      videoFile: { type: 'string', format: 'binary', description: 'File video bài học' },
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
      videoFile: { type: 'string', format: 'binary' },
    },
  },
};
