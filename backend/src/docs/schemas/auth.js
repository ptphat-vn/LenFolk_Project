// Auth + User schema
module.exports = {
  RegisterInput: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Nguyễn Văn A' },
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
      password: { type: 'string', minLength: 8, example: 'MatKhau@123' },
    },
  },
  LoginInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
      password: { type: 'string', example: 'MatKhau@123' },
    },
  },
  RefreshTokenInput: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  },
  AuthTokenResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Đăng nhập thành công' },
          accessToken: { type: 'string', example: 'eyJhbGci... (30m)' },
          refreshToken: { type: 'string', example: 'eyJhbGci... (30d)' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
      name: { type: 'string', example: 'Nguyễn Văn A' },
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
      gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'other' },
      dateOfBirth: { type: 'string', format: 'date-time', nullable: true },
      avatar: { type: 'string', nullable: true },
      phoneNumber: { type: 'string', nullable: true },
      role: {
        type: 'string',
        enum: ['user', 'instructor', 'admin'],
        example: 'user',
        description: 'user mặc định khi đăng ký; instructor/admin do admin gán',
      },
      isActive: { type: 'boolean', example: true },
      isVerified: { type: 'boolean', example: false },
      isSubscribed: { type: 'boolean', example: false, description: 'true khi đã mua thành công ≥1 course/tiết mục' },
      lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateUserInput: {
    type: 'object',
    required: ['name', 'email', 'passwordHash'],
    properties: {
      name: { type: 'string', example: 'Trần Thị B' },
      email: { type: 'string', format: 'email', example: 'tranthib@lenfolk.vn' },
      passwordHash: { type: 'string', example: 'MatKhau@123', description: 'Mật khẩu thô, BE tự hash' },
      role: { type: 'string', enum: ['user', 'instructor', 'admin'], example: 'instructor' },
      phoneNumber: { type: 'string', example: '0901234567' },
    },
  },
  UpdateUserInput: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      gender: { type: 'string', enum: ['male', 'female', 'other'] },
      phoneNumber: { type: 'string' },
      role: { type: 'string', enum: ['user', 'instructor', 'admin'] },
      isActive: { type: 'boolean' },
      isSubscribed: { type: 'boolean' },
      avatar: { type: 'string', format: 'binary', description: 'File ảnh (multipart)' },
    },
  },
};
