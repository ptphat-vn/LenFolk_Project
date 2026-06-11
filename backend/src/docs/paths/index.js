// Gộp tất cả path từ các file con thành object paths của OpenAPI.
// Mỗi resource một file cho dễ đọc.
module.exports = {
  ...require('./auth'),
  ...require('./users'),
  ...require('./courses'),
  ...require('./lessons'),
  ...require('./performances'),
  ...require('./systemSettings'),
  ...require('./enrollments'),
  ...require('./transactions'),
  ...require('./coupons'),
  ...require('./wallets'),
  ...require('./badges'),
  ...require('./notifications'),
  ...require('./progress'),
  ...require('./practiceSessions'),
  ...require('./streaks'),
  ...require('./instructorProfiles'),
  ...require('./permissions'),
  ...require('./auditLogs'),
};
