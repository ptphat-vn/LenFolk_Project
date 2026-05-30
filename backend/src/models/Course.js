const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
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
    // Đánh dấu xem khóa học này có được miễn phí không
    isFree: {
      type: Boolean,
      default: false,
    },
    // Giá khóa học được lấy từ gói Subscription liên kết — không tự nhập ở đây.
    // Dùng Subscription.findOne({ itemType: 'course', courseId: _id }) để lấy giá.
    adminCommissionPercentage: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    courseType: {
      type: String,
      default: 'foundation', // Không còn ép buộc enum cứng
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
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
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollCount: {
      type: Number,
      default: 0,
      min: 0,
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

courseSchema.index({ instructorId: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
