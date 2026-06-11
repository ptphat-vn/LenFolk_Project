const mongoose = require('mongoose');

/**
 * CoursePlan — "gói đăng ký" của một Khóa học.
 * Đây là NƠI ĐỊNH GIÁ của course: admin tạo course (không giá) trước,
 * sau đó tạo CoursePlan để gán giá + chu kỳ. Mỗi course có tối đa 1 plan.
 *
 * Khác Performance (giá nằm thẳng trên tiết mục, mua đứt 1 lần),
 * course bán theo chu kỳ (monthly/quarterly/yearly) → access có hạn.
 */
const coursePlanSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['VND', 'USD'],
      default: 'VND',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    // Bật khi course đã published; tắt khi pending/archived
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

coursePlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('CoursePlan', coursePlanSchema);
