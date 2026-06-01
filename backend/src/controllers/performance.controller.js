const factory = require('../utils/handlerFactory');
const Performance = require('../models/Performance');
const { UserSubscription, Subscription } = require('../models/Subscription');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

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
 * - Admin/Instructor: xem tất cả
 * - Còn lại: chỉ xem các tiết mục đã published
 */
exports.getAll = catchAsync(async (req, res, next) => {
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
  res.status(200).json({ success: true, results: docs.length, data: docs });
});

/**
 * GET /api/performances/:id
 * - Admin/Instructor: xem bất kỳ
 * - Tiết mục isFree = true: ai cũng xem được (nếu published)
 * - Tiết mục isFree = false: phải có subscription active trỏ đến performanceId này
 */
exports.getOne = catchAsync(async (req, res, next) => {
  const performance = await Performance.findById(req.params.id).select('-__v');
  if (!performance)
    return next(new AppError('No performance found with that ID', 404));

  const isPrivileged =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

  if (!isPrivileged && performance.status !== 'published') {
    return next(new AppError('This performance is not available', 403));
  }

  if (!isPrivileged && !performance.isFree) {
    if (!req.user)
      return next(
        new AppError('Please log in to access this performance', 401),
      );
    const hasAccess = await hasPerformanceAccess(req.user._id, performance._id);
    if (!hasAccess) {
      return next(
        new AppError(
          'You need an active subscription to access this performance',
          403,
        ),
      );
    }
  }

  // Lấy thêm thông tin giá từ gói Subscription liên kết
  const plan = await Subscription.findOne({
    itemType: 'performance',
    performanceId: performance._id,
    isActive: true,
  }).select('price currency billingCycle name');

  res.status(200).json({
    success: true,
    data: {
      ...performance.toObject(),
      subscription: plan || null,
    },
  });
});

/**
 * POST /api/performances
 * Instructor/Admin tạo tiết mục mới (giá sẽ đặt qua gói Subscription riêng).
 */
exports.createOne = catchAsync(async (req, res, next) => {
  // instructorId lấy từ token nếu là instructor, hoặc từ body nếu là admin
  if (req.user.role === 'instructor') {
    req.body.instructorId = req.user._id;
  }
  const performance = await Performance.create(req.body);
  res
    .status(201)
    .json({
      success: true,
      message: 'Performance created successfully',
      data: performance,
    });
});

/**
 * PATCH /api/performances/:id
 * Instructor chỉ update tiết mục của mình; Admin update tất cả.
 */
exports.updateOne = catchAsync(async (req, res, next) => {
  const performance = await Performance.findById(req.params.id);
  if (!performance)
    return next(new AppError('No performance found with that ID', 404));

  if (
    req.user.role === 'instructor' &&
    performance.instructorId.toString() !== req.user._id.toString()
  ) {
    return next(
      new AppError(
        'You do not have permission to update this performance',
        403,
      ),
    );
  }

  const updated = await Performance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-__v');
  res
    .status(200)
    .json({
      success: true,
      message: 'Performance updated successfully',
      data: updated,
    });
});

/**
 * DELETE /api/performances/:id
 * Admin only.
 */
exports.deleteOne = factory.deleteOne(Performance);
