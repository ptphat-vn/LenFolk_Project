const TransactionRecord = require('../models/TransactionRecord');

// Populate dùng chung: hiển thị TÊN người dùng / khóa học / tiết mục thay vì id.
const withRefs = (query) =>
  query
    .populate({ path: 'userId', select: 'name email' })
    .populate({ path: 'courseId', select: 'title' })
    .populate({ path: 'performanceId', select: 'title' })
    .populate({ path: 'couponId', select: 'code' })
    .populate({ path: 'reviewedBy', select: 'name email' });

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
    const docs = await withRefs(
      TransactionRecord.find(JSON.parse(queryStr))
        .sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt')
        .skip(skip)
        .limit(limit)
        .select('-__v'),
    );
    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await withRefs(TransactionRecord.findById(req.params.id));
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    // userId đã được populate → so sánh theo _id
    const ownerId = doc.userId?._id || doc.userId;
    if (req.user.role !== 'admin' && !ownerId.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Giao dịch này không thuộc về bạn' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.createOne = async (req, res, next) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'Giao dịch chỉ được tạo qua luồng mua hàng.',
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const doc = await withRefs(
      TransactionRecord.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true }),
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    res.status(200).json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await TransactionRecord.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    res.status(200).json({ success: true, message: 'Xóa thành công', data: null });
  } catch (err) {
    next(err);
  }
};
