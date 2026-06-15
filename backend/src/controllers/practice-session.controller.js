const PracticeSession = require('../models/PracticeSession');

// PS-02: Only return sessions belonging to the current user
exports.getAll = async (req, res, next) => {
  try {
    const sessions = await PracticeSession.find({ userId: req.user._id }).sort(
      '-createdAt',
    );
    res
      .status(200)
      .json({ success: true, results: sessions.length, data: sessions });
  } catch (err) {
    next(err);
  }
};

// PS-03: Strip AI score fields — scores must be set server-side only
exports.createOne = async (req, res, next) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const {
      aiScore,
      rhythmScore,
      pitchScore,
      accuracyScore,
      aiFeedback,
      status,
      userId: _u,
      ...safeBody
    } = req.body;
    const session = await PracticeSession.create({
      ...safeBody,
      userId: req.user._id,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await PracticeSession.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên luyện tập' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem phiên này' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// PS-04: Strip AI score fields on update — same as createOne guard
exports.updateOne = async (req, res, next) => {
  try {
    const doc = await PracticeSession.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên luyện tập' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa phiên này' });
    }
    // eslint-disable-next-line no-unused-vars
    const {
      aiScore,
      rhythmScore,
      pitchScore,
      accuracyScore,
      aiFeedback,
      status,
      userId: _u,
      ...safeBody
    } = req.body;
    const updated = await PracticeSession.findByIdAndUpdate(
      req.params.id,
      safeBody,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await PracticeSession.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên luyện tập' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa phiên này' });
    }
    await PracticeSession.findByIdAndDelete(req.params.id);
    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
