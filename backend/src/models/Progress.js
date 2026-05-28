const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bestPracticeScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

progressSchema.index({ userId: 1, courseId: 1 })
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true })
progressSchema.index({ userId: 1, status: 1 })

module.exports = mongoose.model('Progress', progressSchema)
