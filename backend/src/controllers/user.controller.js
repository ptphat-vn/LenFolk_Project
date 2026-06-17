const User = require('../models/User');
const { writeAuditLog } = require('../utils/audit');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      phoneNumber: req.body.phoneNumber,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    if (req.file) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    await writeAuditLog(req, {
      action: 'UPDATE',
      resource: 'User',
      resourceId: user._id,
      after: user.toJSON(),
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};



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
  const doc = await User.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  const doc = await User.create(req.body);
  await writeAuditLog(req, { action: 'CREATE', resource: 'User', resourceId: doc._id, after: doc.toJSON() });
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
  const doc = await User.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  await writeAuditLog(req, { action: 'UPDATE', resource: 'User', resourceId: doc._id, after: doc.toJSON() });
  res.status(200).json({ success: true, message: 'Cập nhật người dùng thành công', data: doc });
  } catch (err) { next(err); }
};

// Soft-delete: đặt deletedAt thay vì xóa cứng khỏi DB
exports.deleteOne = async (req, res, next) => {
  try {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  await user.softDelete();
  await writeAuditLog(req, { action: 'DELETE', resource: 'User', resourceId: user._id, before: user.toJSON() });
  res.status(200).json({ success: true, message: 'Xóa người dùng thành công', data: null });
  } catch (err) { next(err); }
};
