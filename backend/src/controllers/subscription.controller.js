const { Subscription } = require('../models/Subscription');
const Course = require('../models/Course');
const Performance = require('../models/Performance');

// AC-03: Public listing only returns active plans
exports.getAll = async (req, res, next) => {
  try {
    const plans = await Subscription.find({ isActive: true }).sort('-createdAt');
    res.status(200).json({ success: true, results: plans.length, data: plans });
  } catch (err) {
    next(err);
  }
};

// Tạo gói subscription cho khóa học hoặc tiết mục
exports.createOne = async (req, res, next) => {
  try {
    const { itemType, courseId, performanceId } = req.body;

    if (itemType === 'course') {
      const course = await Course.findById(courseId).select('_id isFree');
      if (!course) (() => { const _e = new Error('No course found with that ID'); _e.statusCode = 404; throw _e; })();
      if (course.isFree)
        (() => { const _e = new Error('Cannot create a subscription plan for a free course.'); _e.statusCode = 400; throw _e; })();
    } else if (itemType === 'performance') {
      const performance =
        await Performance.findById(performanceId).select('_id isFree');
      if (!performance) (() => { const _e = new Error('No performance found with that ID'); _e.statusCode = 404; throw _e; })();
      if (performance.isFree)
        (() => { const _e = new Error('Cannot create a subscription plan for a free performance.'); _e.statusCode = 400; throw _e; })();
    }

    const plan = await Subscription.create(req.body);
    res.status(201).json({ success: true, message: 'Tạo gói đăng ký thành công', data: plan });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await Subscription.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const doc = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    res.status(200).json({ success: true, message: 'Cập nhật gói đăng ký thành công', data: doc });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await Subscription.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    res.status(200).json({ success: true, message: 'Xóa gói đăng ký thành công', data: null });
  } catch (err) {
    next(err);
  }
};
