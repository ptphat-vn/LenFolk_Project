const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['streak', 'completion', 'practice', 'achievement'],
      required: true,
    },
    conditionKey: {
      type: String,
      required: true,
      comment: 'e.g. streak_days, courses_completed, practice_score',
    },
    conditionValue: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

badgeSchema.index({ type: 1 })
badgeSchema.index({ isActive: 1 })

const Badge = mongoose.model('Badge', badgeSchema)

// ------------------------------------

const userBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
)

userBadgeSchema.index({ userId: 1 })
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })

const UserBadge = mongoose.model('UserBadge', userBadgeSchema)

module.exports = { Badge, UserBadge }
