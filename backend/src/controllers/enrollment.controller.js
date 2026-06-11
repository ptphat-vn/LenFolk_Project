const Enrollment = require('../models/Enrollment');

/**
 * GET /api/enrollments/me
 * Danh sách "đã đăng ký cái gì" của user hiện tại.
 * Trả về itemType (course|performance) + thông tin item (title, thumbnail).
 * Mặc định chỉ lấy enrollment đang active & đã thanh toán; truyền ?all=true để xem hết.
 */
exports.getMine = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.all !== 'true') {
      filter.status = 'active';
      filter.isPaid = true;
    }

    const docs = await Enrollment.find(filter)
      .sort('-createdAt')
      .populate({ path: 'courseId', select: 'title thumbnail status' })
      .populate({ path: 'performanceId', select: 'title thumbnail status price' })
      .populate({ path: 'coursePlanId', select: 'price billingCycle currency' });

    const data = docs.map((d) => {
      const o = d.toObject();
      return {
        _id: o._id,
        itemType: o.itemType,
        status: o.status,
        isPaid: o.isPaid,
        startDate: o.startDate,
        endDate: o.endDate, // null = mua đứt vĩnh viễn
        item: o.itemType === 'course' ? o.courseId : o.performanceId,
        plan: o.itemType === 'course' ? o.coursePlanId : null,
      };
    });

    res.status(200).json({ success: true, results: data.length, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/enrollments  — Admin: xem tất cả enrollment (lọc theo ?userId, ?itemType, ?status).
 */
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    ['userId', 'itemType', 'status'].forEach((k) => {
      if (req.query[k]) filter[k] = req.query[k];
    });

    const docs = await Enrollment.find(filter)
      .sort('-createdAt')
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'courseId', select: 'title' })
      .populate({ path: 'performanceId', select: 'title' });

    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};
