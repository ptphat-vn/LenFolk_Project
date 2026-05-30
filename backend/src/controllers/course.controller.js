const factory = require('../utils/handlerFactory');
const Course = require('../models/Course');
const { UserSubscription } = require('../models/Subscription');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Kiểm tra user có quyền truy cập khóa học cụ thể thông qua gói nâng cấp không.
 */
async function hasCourseAccess(userId, courseId) {
  // 1. Kiểm tra xem khóa học có nằm trong enrolledCourses (mua đứt) không
  const User = require('../models/User');
  const user = await User.findById(userId).select('enrolledCourses');
  if (user && user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
    return true;
  }

  // 2. Tìm tất cả các gói subscription đang active của user
  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'courseId' });

  // Kiểm tra xem có gói nào trỏ đúng vào courseId này không
  return activeSubs.some(
    (sub) => sub.subscriptionId?.courseId?.toString() === courseId.toString(),
  );
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/courses
 * - Admin/Instructor: xem tất cả (draft + published)
 * - Còn lại: chỉ xem các khóa học đã published (ai cũng xem được danh sách, kể cả chưa mua)
 */
exports.getAll = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  const isPrivileged =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

  if (!isPrivileged) {
    // Người dùng thường / unauthenticated: chỉ thấy khóa published
    queryObj.status = 'published';
  }

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  let query = Course.find(JSON.parse(queryStr));
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
 * GET /api/courses/:id
 * - Admin/Instructor: xem bất kỳ (kể cả draft)
 * - Khóa học isFree = true: ai cũng xem được (nếu published)
 * - Khóa học isFree = false: phải có gói subscription khớp với courseId đang active
 */
exports.getOne = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).select('-__v');
  if (!course) return next(new AppError('No course found with that ID', 404));

  const isPrivileged =
    req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

  if (!isPrivileged) {
    // Ẩn draft với người dùng thường
    if (course.status !== 'published') {
      return next(new AppError('No course found with that ID', 404));
    }
    // Nếu không free thì phải check xem đã mua gói có chứa khóa này chưa
    if (!course.isFree) {
      if (!req.user) {
        return next(
          new AppError(
            'This is a premium course. Please log in and subscribe to access.',
            403,
          ),
        );
      }
      const hasAccess = await hasCourseAccess(req.user._id, course._id);
      if (!hasAccess) {
        return next(
          new AppError('This course requires an active subscription.', 403),
        );
      }
    }
  }

  res.status(200).json({ success: true, data: course });
});

/**
 * POST /api/courses
 * - Admin, Instructor tạo khóa học (Instructor có thể bị giới hạn tùy logic kinh doanh ở đây)
 */
exports.createOne = catchAsync(async (req, res, next) => {
  // instructorId luôn inject từ token
  const doc = await Course.create({ ...req.body, instructorId: req.user._id });
  res
    .status(201)
    .json({ success: true, message: 'Course created successfully', data: doc });
});

/**
 * PATCH /api/courses/:id
 * - Admin: cập nhật bất kỳ khóa học
 * - Instructor: chỉ cập nhật khóa học của mình
 */
exports.updateOne = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('No course found with that ID', 404));

  if (req.user.role === 'instructor') {
    if (!course.instructorId.equals(req.user._id)) {
      return next(
        new AppError('You do not have permission to update this course', 403),
      );
    }
    // Chặn giảng viên tự ý publish khóa học
    if (req.body.status === 'published') {
      return next(
        new AppError(
          'Instructors cannot publish courses directly. Please set status to pending for admin review.',
          403,
        ),
      );
    }
  }

  const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res
    .status(200)
    .json({
      success: true,
      message: 'Course updated successfully',
      data: updated,
    });
});

exports.deleteOne = factory.deleteOne(Course);
