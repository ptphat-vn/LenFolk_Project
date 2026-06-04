const Performance = require('../models/Performance');
const { UserSubscription, Subscription } = require('../models/Subscription');






// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Kiểm tra user có quyền truy cập tiết mục thông qua gói subscription không.
 */
async function hasPerformanceAccess(userId, performanceId) {
  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'performanceId itemType' });

  return activeSubs.some(
    (sub) =>
      sub.subscriptionId?.itemType === 'performance' &&
      sub.subscriptionId?.performanceId?.toString() ===
        performanceId.toString(),
  );
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/performances
 * - Admin/Instructor: xem tất cả (kể cả pending, archived)
 * - Còn lại: chỉ xem các tiết mục đã published
 */
exports.getAll = async (req, res, next) => {
  try {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  const isPrivileged =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

  if (!isPrivileged) {
    queryObj.status = 'published';
  }

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  let query = Performance.find(JSON.parse(queryStr));
  if (req.query.sort) {
    query = query.sort(req.query.sort.split(',').join(' '));
  } else {
    query = query.sort('-createdAt');
  }
  query = query.skip(skip).limit(limit).select('-__v');

  const docs = await query;

  // Kèm giá từ Subscription liên kết (1 truy vấn batch, tránh N+1).
  // Public chỉ thấy gói đang active; admin/instructor thấy cả gói chưa active
  // (tiết mục pending) để xem được giá đã nhập.
  const subFilter = {
    itemType: 'performance',
    performanceId: { $in: docs.map((d) => d._id) },
  };
  if (!isPrivileged) subFilter.isActive = true;

  const plans = await Subscription.find(subFilter).select(
    'price currency billingCycle name isActive performanceId',
  );
  const planByPerf = new Map(
    plans.map((p) => [p.performanceId.toString(), p]),
  );

  const data = docs.map((d) => ({
    ...d.toObject(),
    subscription: planByPerf.get(d._id.toString()) || null,
  }));

  res.status(200).json({ success: true, results: data.length, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/performances/:id
 * - Admin/Instructor: xem bất kỳ
 * - Tiết mục isFree = true: ai cũng xem được (nếu published)
 * - Tiết mục isFree = false: phải có subscription active trỏ đến performanceId này
 */
exports.getOne = async (req, res, next) => {
  try {
  const performance = await Performance.findById(req.params.id).select('-__v');
  if (!performance)
    return res.status(404).json({ success: false, message: 'No performance found with that ID' });

  const isPrivileged =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

  if (!isPrivileged && performance.status !== 'published') {
    return res.status(403).json({ success: false, message: 'This performance is not available' });
  }

  if (!isPrivileged && !performance.isFree) {
    if (!req.user)
      return res.status(401).json({ success: false, message: 'Please log in to access this performance' });
    const hasAccess = await hasPerformanceAccess(req.user._id, performance._id);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You need an active subscription to access this performance' });
    }
  }

  // Lấy thêm thông tin giá từ gói Subscription liên kết.
  // Public chỉ thấy gói đang active; admin/instructor thấy cả gói chưa active
  // (tiết mục pending) để xem được giá đã nhập.
  const planFilter = {
    itemType: 'performance',
    performanceId: performance._id,
  };
  if (!isPrivileged) planFilter.isActive = true;

  const plan = await Subscription.findOne(planFilter).select(
    'price currency billingCycle name isActive',
  );

  res.status(200).json({
    success: true,
    data: {
      ...performance.toObject(),
      subscription: plan || null,
    },
  });
  } catch (err) { next(err); }
};

/**
 * POST /api/performances
 * Instructor/Admin tạo tiết mục mới.
 * - Instructor: status luôn là 'pending', chờ admin duyệt.
 * - Luôn tạo Subscription plan tự động nếu có price + billingCycle.
 */
exports.createOne = async (req, res, next) => {
  try {
  // Tách price & billingCycle ra để tạo Subscription riêng (không lưu vào Performance)
  const { price, billingCycle, ...performanceData } = req.body;

  // instructorId lấy từ token nếu là instructor, hoặc từ body nếu là admin
  if (req.user.role === 'instructor') {
    performanceData.instructorId = req.user._id;
    performanceData.status = 'pending'; // Instructor luôn chờ admin duyệt
  }

  const performance = await Performance.create(performanceData);

  // Tự động tạo Subscription plan nếu có giá và chu kỳ
  let subscription = null;
  if (price !== undefined && price !== null && billingCycle) {
    try {
      subscription = await Subscription.create({
        name: `${performance.title} — ${billingCycle} [${performance._id}]`,
        itemType: 'performance',
        performanceId: performance._id,
        price,
        billingCycle,
        currency: 'VND',
        isActive: false, // Inactive cho đến khi admin approve performance
      });
    } catch (err) {
      // Nếu tạo Subscription lỗi (vd: trùng tên), log nhưng không block
      console.error('[Performance.createOne] Auto-create subscription error:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    message:
      req.user.role === 'instructor'
        ? 'Tiết mục đã được gửi thành công, đang chờ admin duyệt.'
        : 'Tạo tiết mục thành công.',
    data: performance,
    subscription: subscription || null,
  });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/performances/:id
 * Instructor chỉ update tiết mục của mình; Admin update tất cả.
 * Instructor không được đổi status trực tiếp.
 */
exports.updateOne = async (req, res, next) => {
  try {
  const performance = await Performance.findById(req.params.id);
  if (!performance)
    return res.status(404).json({ success: false, message: 'No performance found with that ID' });

  if (req.user.role === 'instructor') {
    if (performance.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this performance' });
    }
    // Instructor không được tự đổi status
    if (req.body.status) {
      delete req.body.status;
    }
  }

  // Nếu có cập nhật price/billingCycle, cập nhật vào Subscription liên kết
  const { price, billingCycle, ...updateData } = req.body;
  if (price !== undefined || billingCycle !== undefined) {
    const existingSub = await Subscription.findOne({
      itemType: 'performance',
      performanceId: performance._id,
    });
    if (existingSub) {
      if (price !== undefined) existingSub.price = price;
      if (billingCycle !== undefined) existingSub.billingCycle = billingCycle;
      await existingSub.save();
    }
  }

  const updated = await Performance.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-__v');

  res.status(200).json({
    success: true,
    message: 'Cập nhật tiết mục thành công',
    data: updated,
  });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/performances/:id/approve
 * Admin duyệt tiết mục:
 * - Set status = 'published', publishedAt = now
 * - Optionally set adminCommissionPercentage
 */
exports.approveOne = async (req, res, next) => {
  try {
  const performance = await Performance.findById(req.params.id);
  if (!performance)
    return res.status(404).json({ success: false, message: 'No performance found with that ID' });

  if (performance.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Cannot approve a performance with status '${performance.status}'. Only 'pending' performances can be approved.` });
  }

  const { adminCommissionPercentage } = req.body;

  const updateFields = {
    status: 'published',
    publishedAt: new Date(),
  };
  if (adminCommissionPercentage !== undefined) {
    updateFields.adminCommissionPercentage = adminCommissionPercentage;
  }

  const updated = await Performance.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true },
  ).select('-__v');

  // Kích hoạt Subscription plan liên kết (nếu có)
  await Subscription.updateMany(
    { itemType: 'performance', performanceId: performance._id },
    { isActive: true },
  );

  res.status(200).json({
    success: true,
    message: 'Tiết mục đã được duyệt và xuất bản thành công.',
    data: updated,
  });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/performances/:id/reject
 * Admin từ chối tiết mục:
 * - Set status = 'archived'
 */
exports.rejectOne = async (req, res, next) => {
  try {
  const performance = await Performance.findById(req.params.id);
  if (!performance)
    return res.status(404).json({ success: false, message: 'No performance found with that ID' });

  if (performance.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Cannot reject a performance with status '${performance.status}'. Only 'pending' performances can be rejected.` });
  }

  const updated = await Performance.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { new: true, runValidators: true },
  ).select('-__v');

  // Vô hiệu hóa Subscription plan liên kết (nếu có)
  await Subscription.updateMany(
    { itemType: 'performance', performanceId: performance._id },
    { isActive: false },
  );

  const { rejectReason } = req.body;

  res.status(200).json({
    success: true,
    message: 'Tiết mục đã bị từ chối.',
    rejectReason: rejectReason || null,
    data: updated,
  });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/performances/:id
 * Admin only.
 */
exports.deleteOne = async (req, res, next) => {
  try {
  const doc = await Performance.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No performance found with that ID' });
  res.status(200).json({ success: true, message: 'Xóa tiết mục thành công', data: null });
  } catch (err) { next(err); }
};
