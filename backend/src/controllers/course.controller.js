const Course = require('../models/Course');
const CoursePlan = require('../models/CoursePlan');
const Lesson = require('../models/Lesson');
const { hasCourseAccess } = require('../utils/access');
const { writeAuditLog } = require('../utils/audit');

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
    query = query
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .populate({ path: 'instructorId', select: 'name email avatar' });

    const docs = await query;

    // Embed giá từ CoursePlan (batch, tránh N+1).
    const planFilter = { courseId: { $in: docs.map((d) => d._id) } };
    if (!isPrivileged) planFilter.isActive = true;

    const plans = await CoursePlan.find(planFilter).select(
      'price currency billingCycle name isActive courseId',
    );
    const planByCourse = new Map(plans.map((p) => [p.courseId.toString(), p]));

    const data = docs.map((d) => ({
      ...d.toObject(),
      plan: planByCourse.get(d._id.toString()) || null,
    }));

    res.status(200).json({ success: true, results: data.length, data });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .select('-__v')
      .populate({ path: 'instructorId', select: 'name email avatar' });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khóa học' });

    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged) {
      if (course.status !== 'published')
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy khóa học' });

      if (!course.isFree) {
        if (!req.user)
          return res.status(403).json({
            success: false,
            message:
              'Đây là khóa học trả phí. Vui lòng đăng nhập và mua để truy cập.',
          });

        const hasAccess = await hasCourseAccess(req.user._id, course._id);
        if (!hasAccess)
          return res.status(403).json({
            success: false,
            message: 'Khóa học này cần mua mới truy cập được.',
          });
      }
    }

    const planFilter = { courseId: course._id };
    if (!isPrivileged) planFilter.isActive = true;
    const plan = await CoursePlan.findOne(planFilter).select(
      'price currency billingCycle name isActive features',
    );

    res.status(200).json({
      success: true,
      data: { ...course.toObject(), plan: plan || null },
    });
  } catch (err) {
    next(err);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    // Course KHÔNG có giá — giá đặt qua CoursePlan (POST /courses/:id/plan).
    const doc = await Course.create({
      ...req.body,
      instructorId: req.user._id,
    });

    await writeAuditLog(req, {
      action: 'CREATE',
      resource: 'Course',
      resourceId: doc._id,
      after: doc.toObject(),
    });

    res.status(201).json({
      success: true,
      message: 'Tạo khoá học thành công',
      data: doc,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khóa học' });

    const before = course.toObject();

    // Khi status đổi → đồng bộ isActive của CoursePlan liên kết
    if (req.body.status && req.body.status !== course.status) {
      const isNowPublished = req.body.status === 'published';
      const isNowArchived = req.body.status === 'archived';
      if (isNowPublished || isNowArchived) {
        await CoursePlan.updateMany(
          { courseId: course._id },
          { isActive: isNowPublished },
        );
      }
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await writeAuditLog(req, {
      action: 'UPDATE',
      resource: 'Course',
      resourceId: updated._id,
      before,
      after: updated.toObject(),
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật khoá học thành công',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khóa học' });

    // Ràng buộc: không cho xóa khi khóa học còn bài học
    const lessonCount = await Lesson.countDocuments({ courseId: course._id });
    if (lessonCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa khóa học khi vẫn còn ${lessonCount} bài học. Vui lòng xóa hết bài học trước.`,
      });
    }

    const doc = await Course.findByIdAndDelete(course._id);

    // Dọn CoursePlan liên kết
    await CoursePlan.deleteMany({ courseId: doc._id });

    await writeAuditLog(req, {
      action: 'DELETE',
      resource: 'Course',
      resourceId: doc._id,
      before: doc.toObject(),
    });

    res
      .status(200)
      .json({ success: true, message: 'Xóa khoá học thành công', data: null });
  } catch (err) {
    next(err);
  }
};

// ─── CoursePlan (gói đăng ký của course) ───────────────────────────────────────

/**
 * PUT /api/courses/:id/plan — Admin tạo/cập nhật giá cho course (upsert).
 * isActive tự bật khi course đã published.
 */
exports.upsertPlan = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khóa học' });
    if (course.isFree)
      return res.status(400).json({
        success: false,
        message: 'Không thể đặt gói giá cho khóa học miễn phí.',
      });

    const { price, billingCycle, name, description, features } = req.body;

    const plan = await CoursePlan.findOneAndUpdate(
      { courseId: course._id },
      {
        $set: {
          ...(price !== undefined ? { price } : {}),
          ...(billingCycle !== undefined ? { billingCycle } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(features !== undefined ? { features } : {}),
          isActive: course.status === 'published',
        },
        $setOnInsert: { courseId: course._id, currency: 'VND' },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    await writeAuditLog(req, {
      action: 'UPSERT',
      resource: 'CoursePlan',
      resourceId: plan._id,
      after: plan.toObject(),
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật gói đăng ký khoá học thành công',
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};
