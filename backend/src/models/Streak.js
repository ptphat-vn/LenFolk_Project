const mongoose = require('mongoose')

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalActiveDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Streak', streakSchema)
