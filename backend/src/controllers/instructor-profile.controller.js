const InstructorProfile = require('../models/InstructorProfile');
const User = require('../models/User');
const { writeAuditLog } = require('../utils/audit');
const {
  sendInstructorApprovedEmail,
  sendInstructorRejectedEmail,
} = require('../services/email.service');



// Populate TÊN + email người dùng thay vì chỉ trả userId.
const USER_FIELDS = 'name email avatar';

exports.getAll = async (req, res, next) => {
  try {
  const queryObj = { ...req.query };
  ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObj[f]);
  let queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const docs = await InstructorProfile.find(JSON.parse(queryStr))
    .sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt')
    .skip(skip).limit(limit).select('-__v')
    .populate({ path: 'userId', select: USER_FIELDS })
    .populate({ path: 'reviewedBy', select: 'name email' });
  res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
  const doc = await InstructorProfile.findById(req.params.id)
    .populate({ path: 'userId', select: USER_FIELDS })
    .populate({ path: 'reviewedBy', select: 'name email' });
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên' });
  res.status(200).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

exports.createOne = async (req, res, next) => {
  try {
  const doc = await InstructorProfile.create(req.body);
  res.status(201).json({ success: true, message: 'Tạo mới thành công', data: doc });
  } catch (err) { next(err); }
};

exports.updateOne = async (req, res, next) => {
  try {
  const doc = await InstructorProfile.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên' });
  res.status(200).json({ success: true, message: 'Cập nhật thành công', data: doc });
  } catch (err) { next(err); }
};

exports.deleteOne = async (req, res, next) => {
  try {
  const doc = await InstructorProfile.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên' });
  res.status(200).json({ success: true, message: 'Xóa thành công', data: null });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/instructor-profiles/:id/approve — Admin duyệt đơn đăng ký giảng viên.
 * Sau khi duyệt: giảng viên đăng nhập được và đăng tiết mục được.
 */
exports.approve = async (req, res, next) => {
  try {
    const profile = await InstructorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên' });
    if (profile.status === 'approved')
      return res.status(400).json({ success: false, message: 'Hồ sơ này đã được duyệt' });

    profile.status = 'approved';
    profile.rejectReason = null;
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    await profile.save();

    // Đảm bảo user có role instructor
    const user = await User.findByIdAndUpdate(
      profile.userId,
      { role: 'instructor' },
      { returnDocument: 'after' },
    ).select('name email');

    if (user?.email) await sendInstructorApprovedEmail(user);

    await writeAuditLog(req, {
      action: 'APPROVE',
      resource: 'InstructorProfile',
      resourceId: profile._id,
      after: { status: 'approved', userId: profile.userId },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Đã duyệt giảng viên', profileId: profile._id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/instructor-profiles/:id/reject — Admin từ chối đơn đăng ký giảng viên.
 * Body: { reason }
 */
exports.reject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const profile = await InstructorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ giảng viên' });
    if (profile.status === 'approved')
      return res.status(400).json({ success: false, message: 'Hồ sơ đã duyệt, không thể từ chối' });

    profile.status = 'rejected';
    profile.rejectReason = reason || null;
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    await profile.save();

    const user = await User.findById(profile.userId).select('name email');
    if (user?.email) await sendInstructorRejectedEmail(user, reason);

    await writeAuditLog(req, {
      action: 'REJECT',
      resource: 'InstructorProfile',
      resourceId: profile._id,
      after: { status: 'rejected', rejectReason: reason || null },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Đã từ chối đơn giảng viên', profileId: profile._id },
    });
  } catch (err) {
    next(err);
  }
};
