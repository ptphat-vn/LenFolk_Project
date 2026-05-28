const mongoose = require('mongoose')

const moderatorLogSchema = new mongoose.Schema(
  {
    moderatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'approve_comment',
        'delete_comment',
        'warn_user',
        'ban_user',
        'unban_user',
        'resolve_report',
        'dismiss_report',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['user', 'comment', 'report', 'course', 'lesson'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

moderatorLogSchema.index({ moderatorId: 1 })
moderatorLogSchema.index({ targetType: 1, targetId: 1 })
moderatorLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ModeratorLog', moderatorLogSchema)
