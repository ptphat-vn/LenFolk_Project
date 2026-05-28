const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
  },
  { timestamps: true }
)

subscriptionSchema.index({ isActive: 1 })

const Subscription = mongoose.model('Subscription', subscriptionSchema)

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
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'active',
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
      enum: ['ios', 'android', 'stripe', 'google_play', 'zalopay'],
      required: true,
    },
  },
  { timestamps: true }
)

userSubscriptionSchema.index({ userId: 1, status: 1 })
userSubscriptionSchema.index({ userId: 1, endDate: 1 })
userSubscriptionSchema.index({ endDate: 1, status: 1 })

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema)

module.exports = { Subscription, UserSubscription }
