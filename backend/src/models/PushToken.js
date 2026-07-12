const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, trim: true },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    studyReminderHour: { type: Number, min: 0, max: 23, default: 19 },
    studyReminderMinute: { type: Number, min: 0, max: 59, default: 0 },
    lastStudyReminderDate: { type: String, default: null },
    lastStreakReminderDate: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PushToken', pushTokenSchema);
