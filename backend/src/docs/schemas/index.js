// Gộp tất cả schema từ các file con thành components.schemas
module.exports = {
  ...require('./common'),
  ...require('./auth'),
  ...require('./course'),
  ...require('./performance'),
  ...require('./lesson'),
  ...require('./commerce'),
  ...require('./misc'),
  ...require('./aiAnalysis'),
};
