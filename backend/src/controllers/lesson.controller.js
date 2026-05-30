const factory = require('../utils/handlerFactory');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { UserSubscription } = require('../models/Subscription');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Only show published lessons; admin/instructor can see all
exports.getAll = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  const isAdminOrInstructor =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');
  if (!isAdminOrInstructor) {
    queryObj.status = 'published';
  }

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  const docs = await Lesson.find(JSON.parse(queryStr))
    .sort(req.query.sort ? req.query.sort.split(',').join(' ') : 'order')
    .skip(skip)
    .limit(limit)
    .select('-__v');

  res.status(200).json({ success: true, results: docs.length, data: docs });
});

// AC-01: Kiểm tra quyền truy cập bài học
// - isFree === true  → tất cả user đều truy cập được
// - isFree === false → cần có UserSubscription hợp lệ trỏ tới course này
// Admin / Instructor luôn được phép (không cần sub)
exports.getOne = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).select('-__v');
  if (!lesson) return next(new AppError('No lesson found with that ID', 404));

  // Privileged roles bypass subscription check
  const isPrivileged =
    req.user.role === 'admin' || req.user.role === 'instructor';

  if (!isPrivileged) {
    const course = await Course.findById(lesson.courseId).select('isFree');
    if (!course) return next(new AppError('Parent course not found', 404));

    if (!course.isFree) {
      // 1. Kiểm tra enrolledCourses (mua đứt)
      const User = require('../models/User');
      const user = await User.findById(req.user._id).select('enrolledCourses');
      const isEnrolled =
        user &&
        user.enrolledCourses &&
        user.enrolledCourses.includes(course._id);

      if (!isEnrolled) {
        // 2. Tìm xem user có active subscription nào mở khóa course này không
        const activeSubs = await UserSubscription.find({
          userId: req.user._id,
          status: 'active',
          endDate: { $gt: new Date() },
        }).populate({ path: 'subscriptionId', select: 'courseId' });

        const hasAccess = activeSubs.some(
          (sub) =>
            sub.subscriptionId?.courseId?.toString() === course._id.toString(),
        );

        if (!hasAccess) {
          return next(
            new AppError(
              'This lesson belongs to a premium course. Please subscribe to access.',
              403,
            ),
          );
        }
      }
    }
  }

  res.status(200).json({ success: true, data: lesson });
});

// Verify instructor owns the course before creating a lesson; update totalLessons
exports.createOne = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.body.courseId);
  if (!course) return next(new AppError('No course found with that ID', 404));

  if (
    req.user.role === 'instructor' &&
    !course.instructorId.equals(req.user._id)
  ) {
    return next(
      new AppError(
        'You do not have permission to add lessons to this course',
        403,
      ),
    );
  }

  const lesson = await Lesson.create(req.body);

  // Keep totalLessons counter in sync
  await Course.findByIdAndUpdate(req.body.courseId, {
    $inc: { totalLessons: 1 },
  });

  res
    .status(201)
    .json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
});

exports.updateOne = factory.updateOne(Lesson);

// Decrement totalLessons on delete
exports.deleteOne = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return next(new AppError('No lesson found with that ID', 404));

  await Lesson.findByIdAndDelete(req.params.id);
  await Course.findByIdAndUpdate(lesson.courseId, {
    $inc: { totalLessons: -1 },
  });

  res
    .status(200)
    .json({
      success: true,
      message: 'Lesson deleted successfully',
      data: null,
    });
});
