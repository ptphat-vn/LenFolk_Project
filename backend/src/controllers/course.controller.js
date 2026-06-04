const Course = require('../models/Course');
const { UserSubscription } = require('../models/Subscription');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hasCourseAccess(userId, courseId) {
  const User = require('../models/User');

  const user = await User.findById(userId).select('enrolledCourses');
  if (user?.enrolledCourses?.includes(courseId)) return true;

  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'courseId' });

  return activeSubs.some(
    (sub) => sub.subscriptionId?.courseId?.toString() === courseId.toString(),
  );
}

// ─── Controllers ──────────────────────────────────────────────────────────────

exports.getAll = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged) queryObj.status = 'published';

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    let query = Course.find(JSON.parse(queryStr));
    query = req.query.sort
      ? query.sort(req.query.sort.split(',').join(' '))
      : query.sort('-createdAt');
    query = query.skip(skip).limit(limit).select('-__v');

    const docs = await query;
    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err); // ✅
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).select('-__v');
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'No course found with that ID' });

    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged) {
      if (course.status !== 'published')
        return res
          .status(404)
          .json({ success: false, message: 'No course found with that ID' });

      if (!course.isFree) {
        if (!req.user)
          return res.status(403).json({
            success: false,
            message:
              'This is a premium course. Please log in and subscribe to access.',
          });

        const hasAccess = await hasCourseAccess(req.user._id, course._id);
        if (!hasAccess)
          return res.status(403).json({
            success: false,
            message: 'This course requires an active subscription.',
          });
      }
    }

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err); // ✅
  }
};

exports.createOne = async (req, res, next) => {
  try {
    const doc = await Course.create({
      ...req.body,
      instructorId: req.user._id,
    });
    res
      .status(201)
      .json({ success: true, message: 'Tạo khoá học thành công', data: doc });
  } catch (err) {
    next(err); // ✅
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'No course found with that ID' });

    if (req.user.role === 'instructor') {
      if (!course.instructorId.equals(req.user._id))
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this course',
        });

      if (req.body.status === 'published')
        return res.status(403).json({
          success: false,
          message:
            'Instructors cannot publish courses directly. Please set status to pending for admin review.',
        });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({
        success: true,
        message: 'Cập nhật khoá học thành công',
        data: updated,
      });
  } catch (err) {
    next(err); // ✅
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await Course.findByIdAndDelete(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'No document found with that ID' });

    res
      .status(200)
      .json({ success: true, message: 'Xóa khoá học thành công', data: null });
  } catch (err) {
    next(err); // ✅
  }
};
