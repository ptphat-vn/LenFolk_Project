const Enrollment = require('../models/Enrollment');

/**
 * Kiểm tra quyền truy cập qua Enrollment (nguồn sự thật duy nhất).
 * Hợp lệ khi có enrollment active, đã thanh toán, chưa hết hạn (hoặc vĩnh viễn).
 */
const activeEnrollmentFilter = () => ({
  status: 'active',
  isPaid: true,
  $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
});

async function hasCourseAccess(userId, courseId) {
  const found = await Enrollment.exists({
    userId,
    itemType: 'course',
    courseId,
    ...activeEnrollmentFilter(),
  });
  return !!found;
}

async function hasPerformanceAccess(userId, performanceId) {
  const found = await Enrollment.exists({
    userId,
    itemType: 'performance',
    performanceId,
    ...activeEnrollmentFilter(),
  });
  return !!found;
}

module.exports = { hasCourseAccess, hasPerformanceAccess, activeEnrollmentFilter };
