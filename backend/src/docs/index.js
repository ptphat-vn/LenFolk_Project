const swaggerJSDoc = require('swagger-jsdoc');
const schemas = require('./schemas');
const paths = require('./paths');

/**
 * OpenAPI spec cho LenFolk — tách module cho dễ đọc:
 *   docs/schemas/*  → định nghĩa các schema (components.schemas)
 *   docs/paths/*    → định nghĩa endpoint theo từng resource
 * File này chỉ lắp ráp lại. config/swagger.js re-export module này.
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LenFolk API',
      version: '2.0.0',
      description:
        'RESTful API cho nền tảng học nhạc LenFolk.\n\n' +
        '**Vai trò:** `user` (mặc định khi đăng ký) · `instructor` / `admin` (admin gán). ' +
        'Khi user mua thành công, cờ `User.isSubscribed = true` (không đổi role). Xem đã đăng ký gì qua `GET /enrollments/me`.\n\n' +
        '### Kiến trúc định giá (v2)\n' +
        '- **Course** không lưu giá trực tiếp. Admin tạo course (không giá), sau đó đặt giá qua **CoursePlan** (`PUT /courses/{id}/plan`). Course bán **theo chu kỳ** (monthly/quarterly/yearly) → quyền truy cập có hạn.\n' +
        '- **Performance** lưu **giá thẳng trên tiết mục** (`price`). Instructor nhập khi đăng, admin duyệt. Bán **mua đứt 1 lần** → quyền truy cập vĩnh viễn.\n' +
        '- **Enrollment** là nguồn sự thật duy nhất cho quyền truy cập (thay cho UserSubscription/enrolledCourses cũ), có cờ `isPaid`.\n\n' +
        '### Luồng thanh toán (SePay — tự động)\n' +
        '1. User gọi `POST /courses/{id}/purchase` hoặc `POST /performances/{id}/purchase` → nhận `payCode` + `sepayQrUrl` (QR động đã điền sẵn số tiền + nội dung), hệ thống tạo Enrollment(pending) + TransactionRecord(pending).\n' +
        '2. User quét QR và chuyển khoản. SePay phát hiện tiền vào → gọi `POST /payments/sepay/webhook`.\n' +
        '3. Webhook khớp `payCode` → Enrollment `active` + `isPaid`, cộng ví instructor, set `User.isSubscribed=true`. Tự động, không cần admin duyệt.\n' +
        '4. Mobile poll `GET /transaction-records/{id}/status` để biết khi nào `isPaid=true` (đã xác nhận) rồi đóng màn QR.\n\n' +
        'Mọi route bảo vệ cần Bearer JWT ở header `Authorization`.',
      contact: { name: 'LenFolk Team' },
    },
    servers: [
      { url: '/api', description: 'Default Server (relative)' },
      { url: 'https://lenfolk-project.onrender.com/api', description: 'Production Server' },
      { url: 'http://localhost:5000/api', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        sepayApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'SePay gửi `Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>`',
        },
      },
      schemas,
    },
    tags: [
      { name: 'Auth', description: 'Đăng ký, đăng nhập, refresh token' },
      { name: 'Users', description: 'Quản lý người dùng (admin)' },
      { name: 'Courses', description: 'Khóa học + CoursePlan (gói giá) + mua khóa học' },
      { name: 'Lessons', description: 'Bài học trong khóa học' },
      { name: 'Performances', description: 'Tiết mục (giá inline) + duyệt + mua' },
      { name: 'Payments', description: 'Webhook SePay — xác nhận thanh toán tự động' },
      { name: 'Enrollments', description: 'Quyền truy cập đã mua — user xem "đã đăng ký gì"' },
      { name: 'TransactionRecords', description: 'Giao dịch: upload minh chứng, duyệt/từ chối' },
      { name: 'Coupons', description: 'Mã giảm giá (admin)' },
      { name: 'Wallets', description: 'Ví instructor, thông tin ngân hàng, yêu cầu rút tiền' },
      { name: 'Badges', description: 'Huy hiệu' },
      { name: 'Notifications', description: 'Thông báo' },
      { name: 'Progress', description: 'Tiến độ học' },
      { name: 'PracticeSessions', description: 'Phiên luyện tập' },
      { name: 'Streaks', description: 'Chuỗi ngày luyện tập' },
      { name: 'InstructorProfiles', description: 'Hồ sơ giảng viên' },
      { name: 'Permissions', description: 'Phân quyền (admin)' },
      { name: 'AuditLogs', description: 'Nhật ký hệ thống (admin)' },
    ],
    paths,
  },
  apis: [],
};

module.exports = swaggerJSDoc(options);
