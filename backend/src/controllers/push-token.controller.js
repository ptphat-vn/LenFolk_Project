const PushToken = require('../models/PushToken');

exports.register = async (req, res, next) => {
  try {
    const { token, platform, timezone, studyReminderHour, studyReminderMinute } = req.body;
    if (!token || !['android', 'ios'].includes(platform)) return res.status(400).json({ success: false, message: 'Push token không hợp lệ' });
    const doc = await PushToken.findOneAndUpdate(
      { token },
      { userId: req.user._id, platform, timezone: timezone || 'Asia/Ho_Chi_Minh', ...(Number.isInteger(studyReminderHour) ? { studyReminderHour } : {}), ...(Number.isInteger(studyReminderMinute) ? { studyReminderMinute } : {}), isActive: true },
      { upsert: true, returnDocument: 'after', runValidators: true },
    );
    res.status(200).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

exports.unregister = async (req, res, next) => {
  try {
    await PushToken.updateMany({ userId: req.user._id, token: req.body.token }, { $set: { isActive: false } });
    res.status(200).json({ success: true, message: 'Đã hủy đăng ký thiết bị' });
  } catch (error) { next(error); }
};
