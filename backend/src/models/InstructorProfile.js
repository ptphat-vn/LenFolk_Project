const mongoose = require('mongoose')

const instructorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: null,
      maxlength: 1000,
    },
    expertise: {
      type: String,
      default: null,
    },
    websiteUrl: {
      type: String,
      default: null,
    },
    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bankDetails: {
      bankName: { type: String, default: null },
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('InstructorProfile', instructorProfileSchema)
