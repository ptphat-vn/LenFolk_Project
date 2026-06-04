const User = require('../models/User');






exports.getAll = async (req, res, next) => {
  try {
  const queryObj = { ...req.query };
  ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
  let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const docs = await User.find(JSON.parse(queryStr)).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').skip(skip).limit(limit).select('-__v');
  res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
  const doc = await User.findById(req.params.id).populate({ path: 'currentSubscription' });
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  const doc = await User.create(req.body);
  res.status(201).json({ success: true, message: 'Tạo người dùng thành công', data: doc });
  } catch (err) { next(err); }
};

exports.updateOne = async (req, res, next) => {
  try {
  if (req.file) {
    req.body.avatar = req.file.path;
  }
  // Strip password fields: findByIdAndUpdate bypasses pre-save bcrypt hook
  delete req.body.passwordHash;
  delete req.body.password;
  const doc = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công', data: doc });
  } catch (err) { next(err); }
};

// Soft-delete: đặt deletedAt thay vì xóa cứng khỏi DB
exports.deleteOne = async (req, res, next) => {
  try {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No user found with that ID' });
  }
  await user.softDelete();
  res.status(200).json({ success: true, message: 'Xóa người dùng thành công', data: null });
  } catch (err) { next(err); }
};
