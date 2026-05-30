const mongoose = require('mongoose');

/**
 * Tiết mục - Một tiết mục biểu diễn được bán qua gói Subscription.
 * Giá của tiết mục được lấy từ gói Subscription liên kết (không tự nhập).
 */
const performanceSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    // URL video tiết mục (preview hoặc full tùy theo quyền truy cập)
    videoUrl: {
      type: String,
      default: null,
    },
    // Tiết mục miễn phí hay không
    isFree: {
      type: Boolean,
      default: false,
    },
    // Thể loại: dân ca, nhạc cụ, hát, v.v.
    genre: {
      type: String,
      default: null,
    },
    // Thời lượng tính bằng giây
    duration: {
      type: Number,
      default: null,
      min: 0,
    },
    adminCommissionPercentage: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

performanceSchema.index({ instructorId: 1 });
performanceSchema.index({ status: 1 });
performanceSchema.index({ genre: 1 });
performanceSchema.index({ isFeatured: 1 });
performanceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Performance', performanceSchema);
