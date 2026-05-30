const factory = require('../utils/handlerFactory');
const { Subscription } = require('../models/Subscription');
const Course = require('../models/Course');
const Performance = require('../models/Performance');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// AC-03: Public listing only returns active plans
exports.getAll = catchAsync(async (req, res, next) => {
  const plans = await Subscription.find({ isActive: true }).sort('-createdAt');
  res.status(200).json({ success: true, results: plans.length, data: plans });
});

// Tạo gói subscription cho khóa học hoặc tiết mục
exports.createOne = catchAsync(async (req, res, next) => {
  const { itemType, courseId, performanceId } = req.body;

  if (itemType === 'course') {
    const course = await Course.findById(courseId).select('_id isFree');
    if (!course) return next(new AppError('No course found with that ID', 404));
    if (course.isFree)
      return next(
        new AppError(
          'Cannot create a subscription plan for a free course.',
          400,
        ),
      );
  } else if (itemType === 'performance') {
    const performance =
      await Performance.findById(performanceId).select('_id isFree');
    if (!performance)
      return next(new AppError('No performance found with that ID', 404));
    if (performance.isFree)
      return next(
        new AppError(
          'Cannot create a subscription plan for a free performance.',
          400,
        ),
      );
  }

  const plan = await Subscription.create(req.body);
  res.status(201).json({ success: true, data: plan });
});

exports.getOne = factory.getOne(Subscription);
exports.updateOne = factory.updateOne(Subscription);
exports.deleteOne = factory.deleteOne(Subscription);
