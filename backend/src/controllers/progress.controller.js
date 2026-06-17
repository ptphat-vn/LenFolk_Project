const Progress = require('../models/Progress');

// PS-01: Only return progress records belonging to the current user
exports.getAll = async (req, res, next) => {
  try {
    const docs = await Progress.find({ userId: req.user._id }).sort(
      '-lastAccessedAt',
    );
    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

// Inject userId from token, prevent spoofing via body
exports.createOne = async (req, res, next) => {
  try {
    const doc = await Progress.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await Progress.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem bản ghi này' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const doc = await Progress.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bản ghi này' });
    }
    // Prevent userId/courseId/lessonId spoofing on update
    delete req.body.userId;
    const updated = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await Progress.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bản ghi này' });
    }
    await Progress.findByIdAndDelete(req.params.id);
    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
