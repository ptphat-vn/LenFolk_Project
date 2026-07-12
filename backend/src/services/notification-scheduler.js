const Notification = require('../models/Notification');
const PushToken = require('../models/PushToken');
const Streak = require('../models/Streak');
const { sendPushMessages } = require('./push-notification.service');

const localParts = (date, timezone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const value = (type) => parts.find((part) => part.type === type)?.value;
    return { date: `${value('year')}-${value('month')}-${value('day')}`, hour: Number(value('hour')), minute: Number(value('minute')) };
  } catch { return localParts(date, 'Asia/Ho_Chi_Minh'); }
};

async function runNotificationScheduler() {
  const now = new Date();
  const tokens = await PushToken.find({ isActive: true }).lean();
  const userIds = [...new Set(tokens.map((token) => String(token.userId)))];
  const streaks = await Streak.find({ userId: { $in: userIds } }).lean();
  const streakByUser = new Map(streaks.map((streak) => [String(streak.userId), streak]));
  for (const token of tokens) {
    const local = localParts(now, token.timezone);
    let payload = null;
    let marker = null;
    if (local.hour === token.studyReminderHour && local.minute === token.studyReminderMinute && token.lastStudyReminderDate !== local.date) {
      payload = { title: 'Đến giờ học rồi', body: 'Dành vài phút luyện sáo cùng LenFolk nhé.', data: { type: 'study_reminder', url: '/(tabs)' } };
      marker = 'lastStudyReminderDate';
    } else if (local.hour === 21 && token.lastStreakReminderDate !== local.date) {
      const streak = streakByUser.get(String(token.userId));
      const lastActiveDate = streak?.lastActiveDate ? localParts(new Date(streak.lastActiveDate), token.timezone).date : null;
      if (streak?.currentStreak > 0 && lastActiveDate !== local.date) {
        payload = { title: 'Streak sắp bị mất', body: `Bạn đang có streak ${streak.currentStreak} ngày. Học ngay để giữ chuỗi nhé!`, data: { type: 'streak', url: '/(tabs)' } };
        marker = 'lastStreakReminderDate';
      }
    }
    if (!payload || !marker) continue;
    const claimed = await PushToken.findOneAndUpdate({ _id: token._id, [marker]: { $ne: local.date } }, { $set: { [marker]: local.date } });
    if (!claimed) continue;
    await Notification.create({ userId: token.userId, title: payload.title, body: payload.body, type: payload.data.type === 'streak' ? 'streak' : 'system', data: payload.data });
    await sendPushMessages([{ to: token.token, sound: 'default', channelId: 'default', ...payload }]);
  }
}

function startNotificationScheduler() {
  const run = () => runNotificationScheduler().catch((error) => console.error('Notification scheduler failed:', error));
  run();
  const timer = setInterval(run, 60 * 1000);
  timer.unref();
}

module.exports = startNotificationScheduler;
