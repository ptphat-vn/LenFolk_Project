const mongoose = require('mongoose')

// Singleton document lưu các chỉ số tổng quan của website.
// Dùng "key" để định danh bản ghi duy nhất (mặc định: 'global').
const siteStatSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('SiteStat', siteStatSchema)
