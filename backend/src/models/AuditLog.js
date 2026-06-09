const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['admin', 'instructor', 'learner', 'guest'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      comment: 'e.g. CREATE, UPDATE, DELETE, LOGIN, PUBLISH',
    },
    resource: {
      type: String,
      required: true,
      comment: 'e.g. Course, Lesson, User, Subscription',
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

auditLogSchema.index({ actorId: 1 })
auditLogSchema.index({ resource: 1, resourceId: 1 })
auditLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
