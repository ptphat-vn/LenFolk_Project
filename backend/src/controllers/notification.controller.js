const Notification = require('../models/Notification');






// Only return notifications belonging to the current user
exports.getAll = async (req, res, next) => {
  try {
  const docs = await Notification.find({ userId: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
  const doc = await Notification.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  const doc = await Notification.create(req.body);
  res.status(201).json({ success: true, message: 'Tạo mới thành công', data: doc });
  } catch (err) { next(err); }
};

exports.updateOne = async (req, res, next) => {
  try {
  const existing = await Notification.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  if (!existing.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const updates =
    req.user.role === 'admin'
      ? req.body
      : {
          isRead: req.body.isRead,
          readAt: req.body.isRead ? new Date() : null,
        };

  const doc = await Notification.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (err) { next(err); }
};

exports.deleteOne = async (req, res, next) => {
  try {
  const doc = await Notification.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, message: 'Xóa thành công', data: null });
  } catch (err) { next(err); }
};
