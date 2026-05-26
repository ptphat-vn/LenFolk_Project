const mongoose = require('mongoose')

const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    audioFileUrl: {
      type: String,
      default: null,
    },
    aiScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    rhythmScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    pitchScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    accuracyScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    aiFeedback: {
      type: String,
      default: null,
    },
    referenceAudio: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'seconds',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

practiceSessionSchema.index({ userId: 1, lessonId: 1 })
practiceSessionSchema.index({ userId: 1, status: 1 })
practiceSessionSchema.index({ lessonId: 1 })

module.exports = mongoose.model('PracticeSession', practiceSessionSchema)
