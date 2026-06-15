const mongoose = require('mongoose');

/**
 * Enrollment — bản ghi "user đã mua quyền truy cập gì".
 * Nguồn sự thật DUY NHẤT cho quyền truy cập (thay cho UserSubscription + enrolledCourses cũ).
 *
 * - itemType='course'      → trỏ coursePlanId + courseId; access có hạn (endDate theo billingCycle).
 * - itemType='performance' → trỏ performanceId; mua đứt (endDate = null = vĩnh viễn).
 */
const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
      type: String,
      enum: ['course', 'performance'],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    coursePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoursePlan',
      default: null,
    },
    performanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Performance',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    // Cờ đã thanh toán & được duyệt (tiện quản lý/lọc)
    isPaid: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
    },
    // null = mua đứt vĩnh viễn (performance); có giá trị = hết hạn (course)
    endDate: {
      type: Date,
      default: null,
    },
    platform: {
      type: String,
      enum: ['sepay', 'stripe', 'ios', 'android', 'google_play'],
      default: 'sepay',
    },
  },
  { timestamps: true },
);

enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ userId: 1, courseId: 1 });
enrollmentSchema.index({ userId: 1, performanceId: 1 });
enrollmentSchema.index({ endDate: 1, status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
