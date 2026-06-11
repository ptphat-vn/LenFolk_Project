const AuditLog = require('../models/AuditLog');

/**
 * Ghi nhật ký hệ thống. Gọi sau các hành động ghi quan trọng
 * (duyệt/từ chối, CRUD course/user/coupon/plan, payout...).
 *
 * KHÔNG bao giờ làm hỏng request chính: lỗi ghi log chỉ console.error.
 *
 * @param {object} req   express request (lấy actor + ip)
 * @param {object} opts  { action, resource, resourceId, before, after }
 */
async function writeAuditLog(req, { action, resource, resourceId = null, before = null, after = null }) {
  try {
    const actor = req?.user;
    if (!actor) return; // hành động ẩn danh thì bỏ qua
    await AuditLog.create({
      actorId: actor._id,
      actorRole: actor.role,
      action,
      resource,
      resourceId,
      before,
      after,
      ipAddress: req.ip || req.headers?.['x-forwarded-for'] || null,
    });
  } catch (err) {
    console.error('[writeAuditLog] failed:', err.message);
  }
}

module.exports = { writeAuditLog };
