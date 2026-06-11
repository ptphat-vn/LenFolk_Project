// Spec OpenAPI được tách module trong src/docs/ cho dễ đọc.
// File này chỉ re-export để giữ nguyên đường import cũ (routes/index.js).
module.exports = require('../docs');
