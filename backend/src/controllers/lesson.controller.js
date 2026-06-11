const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { hasCourseAccess } = require('../utils/access');

// Only show published lessons; admin/instructor can see all
exports.getAll = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

// AC-01: Kiểm tra quyền truy cập bài học
// - isFree === true  → tất cả user đều truy cập được
// - isFree === false → cần có UserSubscription hợp lệ trỏ tới course này
// Admin / Instructor luôn được phép (không cần sub)
exports.getOne = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).select('-__v');
    if (!lesson) return res.status(404).json({ success: false, message: 'No lesson found with that ID' });

    // Privileged roles bypass subscription check
    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged) {
      const course = await Course.findById(lesson.courseId).select('isFree status');
      if (!course) return res.status(404).json({ success: false, message: 'Parent course not found' });

      if (lesson.status !== 'published' || course.status !== 'published') {
        return res.status(404).json({ success: false, message: 'No lesson found with that ID' });
      }

      if (!course.isFree) {
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Please log in to access this premium lesson.' });
        }

        const hasAccess = await hasCourseAccess(req.user._id, course._id);
        if (!hasAccess) {
          return res.status(403).json({ success: false, message: 'This lesson belongs to a premium course. Please subscribe to access.' });
        }
      }
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

// Verify instructor owns the course before creating a lesson; update totalLessons
exports.createOne = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.videoUrl = req.file.path;
    }

    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'No course found with that ID' });

    if (
      req.user.role === 'instructor' &&
      !course.instructorId.equals(req.user._id)
    ) {
      return res.status(403).json({ success: false, message: 'You do not have permission to add lessons to this course' });
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
        message: 'Tạo bài học thành công',
        data: lesson,
      });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.videoUrl = req.file.path;
    }

    const doc = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    res.status(200).json({ success: true, message: 'Cập nhật bài học thành công', data: doc });
  } catch (err) {
    next(err);
  }
};

// Decrement totalLessons on delete
exports.deleteOne = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'No lesson found with that ID' });

    await Lesson.findByIdAndDelete(req.params.id);
    await Course.findByIdAndUpdate(lesson.courseId, {
      $inc: { totalLessons: -1 },
    });

    res
      .status(200)
      .json({
        success: true,
        message: 'Xóa bài học thành công',
        data: null,
      });
  } catch (err) {
    next(err);
  }
};
