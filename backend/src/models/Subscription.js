const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // Gắn trực tiếp gói cước này với 1 khóa học cụ thể
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
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
    maxCourses: {
      type: Number,
      default: -1,
      comment: '-1 means unlimited',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCodeUrl: {
      type: String,
      default: null,
      comment: 'URL of the QR code image for manual bank transfer payment',
    },
  },
  { timestamps: true },
);

subscriptionSchema.index({ isActive: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ------------------------------------

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'trial', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'stripe', 'google_play', 'qr_manual'],
      required: true,
    },
  },
  { timestamps: true },
);

userSubscriptionSchema.index({ userId: 1, status: 1 });
userSubscriptionSchema.index({ userId: 1, endDate: 1 });
userSubscriptionSchema.index({ endDate: 1, status: 1 });

const UserSubscription = mongoose.model(
  'UserSubscription',
  userSubscriptionSchema,
);

module.exports = { Subscription, UserSubscription };
