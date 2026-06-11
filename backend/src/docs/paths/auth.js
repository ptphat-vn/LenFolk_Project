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
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng nhập',
      requestBody: jsonBody('LoginInput'),
      responses: { 200: authOk, 401: err('Sai email hoặc mật khẩu') },
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
};
