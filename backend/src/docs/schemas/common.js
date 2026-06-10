// Schema dùng chung
module.exports = {
  PaginationMeta: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      results: { type: 'integer', example: 10 },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'string', example: 'fail' },
      message: { type: 'string', example: 'Error message description' },
    },
  },
  SuccessMessage: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Thao tác thành công' },
      data: { type: 'object', nullable: true },
    },
  },
};
