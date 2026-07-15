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
  GoogleLoginInput: {
    type: 'object',
    required: ['idToken'],
    properties: {
      idToken: {
        type: 'string',
        description:
          'idToken (JWT) lấy từ Google Sign-In ở phía client (mobile/web). ' +
          'Server xác minh với Google, tự động đăng nhập nếu email đã tồn tại ' +
          'hoặc tạo tài khoản mới (đã xác thực sẵn) nếu chưa có.',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
      },
    },
  },
  RefreshTokenInput: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  },
  RegisterInstructorInput: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Trần Văn Sư' },
      email: { type: 'string', format: 'email', example: 'giangvien@lenfolk.vn' },
      password: { type: 'string', minLength: 8, example: 'MatKhau@123' },
      bio: { type: 'string', example: 'Giảng viên đàn tranh 10 năm kinh nghiệm' },
      expertise: { type: 'string', example: 'Đàn tranh, Đàn bầu' },
      websiteUrl: { type: 'string', example: 'https://example.com' },
      bankDetails: {
        type: 'object',
        properties: {
          bankName: { type: 'string', example: 'Vietcombank' },
          accountName: { type: 'string', example: 'TRAN VAN SU' },
          accountNumber: { type: 'string', example: '0123456789' },
        },
      },
    },
  },
  RejectInstructorInput: {
    type: 'object',
    properties: {
      reason: { type: 'string', example: 'Hồ sơ thiếu thông tin chuyên môn' },
    },
  },
  VerifyEmailInput: {
    type: 'object',
    required: ['email', 'code'],
    properties: {
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
      code: { type: 'string', example: '482910', description: 'Mã OTP 6 số gửi qua email' },
    },
  },
  ResendVerificationInput: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
    },
  },
  ForgotPasswordInput: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
    },
  },
  ResetPasswordInput: {
    type: 'object',
    required: ['email', 'code', 'newPassword'],
    properties: {
      email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
      code: { type: 'string', example: '482910', description: 'Mã OTP 6 số gửi qua email' },
      newPassword: { type: 'string', minLength: 8, example: 'MatKhauMoi@123' },
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
      provider: {
        type: 'string',
        enum: ['local', 'google'],
        example: 'local',
        description: 'Nhà cung cấp đăng nhập: local (email/mật khẩu) hoặc google',
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
