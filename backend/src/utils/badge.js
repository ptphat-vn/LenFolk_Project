const { Badge, UserBadge } = require('../models/Badge');
const Notification = require('../models/Notification');

/**
 * Trao badge cho user dựa trên một chỉ số đạt ngưỡng.
 * Gọi sau khi cập nhật streak/practice/progress.
 *
 * @param {ObjectId} userId
 * @param {string} conditionKey  vd 'streak_days', 'courses_completed', 'practice_score'
 * @param {number} value         giá trị hiện tại của chỉ số
 * @returns {Promise<Array>} danh sách badge vừa được trao (mới)
 */
async function evaluateBadges(userId, conditionKey, value) {
  try {
    // Các badge đủ điều kiện theo ngưỡng
    const candidates = await Badge.find({
      isActive: true,
      conditionKey,
      conditionValue: { $lte: value },
    }).select('_id name');

    if (!candidates.length) return [];

    // Lọc ra những badge user chưa có
    const owned = await UserBadge.find({
      userId,
      badgeId: { $in: candidates.map((b) => b._id) },
    }).select('badgeId');
    const ownedSet = new Set(owned.map((u) => u.badgeId.toString()));

    const fresh = candidates.filter((b) => !ownedSet.has(b._id.toString()));
    if (!fresh.length) return [];

    const awarded = [];
    for (const badge of fresh) {
      try {
        await UserBadge.create({ userId, badgeId: badge._id });
        awarded.push(badge);
        // Tạo thông báo (best-effort)
        await Notification.create({
          userId,
          title: 'Bạn vừa nhận huy hiệu mới!',
          body: `Chúc mừng! Bạn đã đạt huy hiệu "${badge.name}".`,
          type: 'badge',
        }).catch(() => {});
      } catch (e) {
        // Trùng unique (đã có) → bỏ qua
        if (e.code !== 11000) console.error('[evaluateBadges] award error:', e.message);
      }
    }
    return awarded;
  } catch (err) {
    console.error('[evaluateBadges] failed:', err.message);
    return [];
  }
}

module.exports = { evaluateBadges };
