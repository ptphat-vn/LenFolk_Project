const Coupon = require('../models/Coupon');
const { writeAuditLog } = require('../utils/audit');



exports.getAll = async (req, res, next) => {
  try {
  const queryObj = { ...req.query };
  ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
  let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const docs = await Coupon.find(JSON.parse(queryStr)).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').skip(skip).limit(limit).select('-__v');
  res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
  const doc = await Coupon.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  // Ensure code is uppercase
  if (req.body.code) {
    req.body.code = req.body.code.toUpperCase();
  }
  const doc = await Coupon.create(req.body);
  await writeAuditLog(req, { action: 'CREATE', resource: 'Coupon', resourceId: doc._id, after: doc.toObject() });
  res.status(201).json({
    success: true,
    message: 'Tạo mã giảm giá thành công',
    data: doc,
  });
  } catch (err) { next(err); }
};

exports.updateOne = async (req, res, next) => {
  try {
  const doc = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  await writeAuditLog(req, { action: 'UPDATE', resource: 'Coupon', resourceId: doc._id, after: doc.toObject() });
  res.status(200).json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (err) { next(err); }
};

exports.deleteOne = async (req, res, next) => {
  try {
  const doc = await Coupon.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  await writeAuditLog(req, { action: 'DELETE', resource: 'Coupon', resourceId: doc._id, before: doc.toObject() });
  res.status(200).json({ success: true, message: 'Xóa thành công', data: null });
  } catch (err) { next(err); }
};
