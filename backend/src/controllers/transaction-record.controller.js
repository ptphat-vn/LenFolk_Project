const TransactionRecord = require('../models/TransactionRecord');






exports.getAll = async (req, res, next) => {
  try {
  const queryObj = { ...req.query };
  ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
  if (req.user.role !== 'admin') {
    queryObj.userId = req.user._id;
  }
  let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const docs = await TransactionRecord.find(JSON.parse(queryStr)).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').skip(skip).limit(limit).select('-__v');
  res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
  const doc = await TransactionRecord.findById(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  if (req.user.role !== 'admin' && !doc.userId.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Forbidden: this transaction does not belong to you' });
  }
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  return res.status(403).json({
    success: false,
    message: 'Transaction records can only be created through the purchase flow.',
  });
  } catch (err) { next(err); }
};

exports.updateOne = async (req, res, next) => {
  try {
  const doc = await TransactionRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (err) { next(err); }
};

exports.deleteOne = async (req, res, next) => {
  try {
  const doc = await TransactionRecord.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
  res.status(200).json({ success: true, message: 'Xóa thành công', data: null });
  } catch (err) { next(err); }
};
