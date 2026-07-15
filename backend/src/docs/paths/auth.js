const { jsonBody, err } = require('./_shared');

const authOk = {
  description: 'Thành công',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokenResponse' } } },
};

module.exports = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản (role mặc định: user)',
      requestBody: jsonBody('RegisterInput'),
      responses: { 201: authOk, 400: err('Email đã tồn tại / mật khẩu yếu') },
    },
  },
  '/auth/register-instructor': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản giảng viên (chờ admin duyệt)',
      description:
        'Tạo tài khoản role=instructor ở trạng thái **pending**. CHƯA trả token — ' +
        'phải được admin duyệt (`PATCH /instructor-profiles/{id}/approve`) mới đăng nhập được.',
      requestBody: jsonBody('RegisterInstructorInput'),
      responses: {
        201: { description: 'Đã gửi đơn, chờ duyệt' },
        400: err('Email đã tồn tại'),
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng nhập',
      description: 'Giảng viên chưa được duyệt (pending/rejected) sẽ bị chặn với mã 403.',
      requestBody: jsonBody('LoginInput'),
      responses: {
        200: authOk,
        401: err('Sai email hoặc mật khẩu'),
        403: err('Giảng viên đang chờ duyệt / bị từ chối'),
      },
    },
  },
  '/auth/refresh-token': {
    post: {
      tags: ['Auth'],
      summary: 'Làm mới access token',
      requestBody: jsonBody('RefreshTokenInput'),
      responses: { 200: authOk, 401: err('Refresh token không hợp lệ') },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng xuất (xóa refresh token)',
      requestBody: jsonBody('RefreshTokenInput'),
      responses: { 200: { description: 'Đăng xuất thành công' }, 401: err('Token không hợp lệ') },
    },
  },
  '/auth/verify-email': {
    post: {
      tags: ['Auth'],
      summary: 'Xác thực email bằng mã OTP 6 số',
      description: 'Nhập mã OTP đã gửi tới email khi đăng ký. Thành công → `isVerified=true`.',
      requestBody: jsonBody('VerifyEmailInput'),
      responses: {
        200: { description: 'Xác thực thành công' },
        400: err('Mã sai / hết hạn / đã xác thực'),
        404: err('Không tìm thấy tài khoản'),
      },
    },
  },
  '/auth/resend-verification': {
    post: {
      tags: ['Auth'],
      summary: 'Gửi lại mã OTP xác thực email',
      description: 'Sinh mã mới và gửi qua email (hiệu lực 10 phút). Trả message trung tính để tránh dò email.',
      requestBody: jsonBody('ResendVerificationInput'),
      responses: { 200: { description: 'Đã xử lý yêu cầu' } },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Quên mật khẩu — gửi mã OTP đặt lại qua email',
      description: 'Sinh mã OTP đặt lại mật khẩu (hiệu lực 10 phút). Trả message trung tính để tránh dò email.',
      requestBody: jsonBody('ForgotPasswordInput'),
      responses: { 200: { description: 'Đã xử lý yêu cầu' } },
    },
  },
  '/auth/reset-password': {
    post: {
      tags: ['Auth'],
      summary: 'Đặt lại mật khẩu bằng mã OTP',
      description: 'Xác minh mã OTP rồi đặt mật khẩu mới. Mọi phiên đăng nhập cũ bị thu hồi (refreshToken bị xóa).',
      requestBody: jsonBody('ResetPasswordInput'),
      responses: {
        200: { description: 'Đặt lại mật khẩu thành công' },
        400: err('Mã sai / hết hạn'),
        404: err('Không tìm thấy tài khoản'),
      },
    },
  },
};
