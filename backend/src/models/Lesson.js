const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'seconds',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    transcript: {
      type: String,
      default: null,
    },
    techniques: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

lessonSchema.index({ courseId: 1, order: 1 })
lessonSchema.index({ courseId: 1, status: 1 })

module.exports = mongoose.model('Lesson', lessonSchema)
