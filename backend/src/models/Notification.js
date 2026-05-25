const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['lesson', 'badge', 'subscription', 'streak', 'moderation', 'system'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, isRead: 1 })
notificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
