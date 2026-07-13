const Performance = require('../models/Performance');
const { hasPerformanceAccess } = require('../utils/access');
const { writeAuditLog } = require('../utils/audit');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapUploadedDocuments(files = []) {
  return files.map((file) => ({
    name: file.originalname,
    url: file.path,
    publicId: file.filename || null,
    format: file.format || null,
    resourceType: file.resource_type || 'raw',
    bytes: file.size || null,
  }));
}

function getUploadedFiles(files, field) {
  if (!files) return [];
  if (Array.isArray(files)) return field === 'documents' ? files : [];
  return Array.isArray(files[field]) ? files[field] : [];
}

function getStringArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/performances
 * - Admin/Instructor: xem tất cả (kể cả pending, archived)
 * - Còn lại: chỉ xem các tiết mục đã published
 * Giá nằm thẳng trên tiết mục nên không cần truy vấn phụ.
 */
exports.getAll = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged) queryObj.status = 'published';

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    let query = Performance.find(JSON.parse(queryStr));
    query = req.query.sort
      ? query.sort(req.query.sort.split(',').join(' '))
      : query.sort('-createdAt');
    query = query
      .skip(skip)
      .limit(limit)
      .select(isPrivileged ? '-__v' : '-__v -imageUrls -documents')
      .populate({ path: 'instructorId', select: 'name email avatar' });

    const docs = await query;
    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/performances/:id
 * - Admin/Instructor: xem bất kỳ
 * - isFree=true: ai cũng xem (nếu published)
 * - isFree=false: cần Enrollment active trỏ tới tiết mục
 */
exports.getOne = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id)
      .select('-__v')
      .populate({ path: 'instructorId', select: 'name email avatar' });
    if (!performance)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tiết mục' });

    const isPrivileged =
      req.user && (req.user.role === 'admin' || req.user.role === 'instructor');

    if (!isPrivileged && performance.status !== 'published') {
      return res.status(403).json({ success: false, message: 'Tiết mục này hiện không khả dụng' });
    }

    if (!isPrivileged && !performance.isFree) {
      if (!req.user)
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để truy cập tiết mục này' });
      const hasAccess = await hasPerformanceAccess(req.user._id, performance._id);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Bạn cần mua tiết mục này để truy cập' });
      }
    }

    res.status(200).json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/performances
 * Instructor/Admin tạo tiết mục mới kèm GIÁ (price).
 * - Instructor: status luôn 'pending', chờ admin duyệt.
 */
exports.createOne = async (req, res, next) => {
  try {
    const performanceData = { ...req.body };
    const uploadedDocuments = mapUploadedDocuments(getUploadedFiles(req.files, 'documents'));
    const uploadedImages = [
      ...getUploadedFiles(req.files, 'imageUrls'),
      ...getUploadedFiles(req.files, 'images'),
    ].map((file) => file.path);
    if (uploadedDocuments.length > 0) {
      performanceData.documents = uploadedDocuments;
    }
    if (uploadedImages.length > 0) {
      performanceData.imageUrls = [
        ...getStringArray(performanceData.existingImageUrls ?? performanceData.imageUrls),
        ...uploadedImages,
      ];
    }
    delete performanceData.existingImageUrls;

    if (req.user.role === 'instructor') {
      performanceData.instructorId = req.user._id;
      performanceData.status = 'pending';
    }

    const performance = await Performance.create(performanceData);

    await writeAuditLog(req, {
      action: 'CREATE',
      resource: 'Performance',
      resourceId: performance._id,
      after: performance.toObject(),
    });

    res.status(201).json({
      success: true,
      message:
        req.user.role === 'instructor'
          ? 'Tiết mục đã được gửi thành công, đang chờ admin duyệt.'
          : 'Tạo tiết mục thành công.',
      data: performance,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/performances/:id
 * Instructor chỉ update tiết mục của mình; Admin update tất cả.
 * Instructor không được đổi status trực tiếp.
 */
exports.updateOne = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tiết mục' });

    if (req.user.role === 'instructor') {
      if (performance.instructorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa tiết mục này' });
      }
      if (req.body.status) delete req.body.status;
    }

    const before = performance.toObject();
    const uploadedDocuments = mapUploadedDocuments(getUploadedFiles(req.files, 'documents'));
    const uploadedImages = [
      ...getUploadedFiles(req.files, 'imageUrls'),
      ...getUploadedFiles(req.files, 'images'),
    ].map((file) => file.path);
    const setFields = { ...req.body };
    const pushFields = {};

    if (uploadedDocuments.length > 0) {
      pushFields.documents = { $each: uploadedDocuments };
    }
    const submittedExistingImages =
      setFields.existingImageUrls !== undefined
        ? getStringArray(setFields.existingImageUrls)
        : undefined;
    if (uploadedImages.length > 0) {
      const keptImages =
        submittedExistingImages !== undefined
          ? submittedExistingImages
          : setFields.imageUrls !== undefined
            ? getStringArray(setFields.imageUrls)
            : getStringArray(performance.imageUrls);
      setFields.imageUrls = [...keptImages, ...uploadedImages];
    } else if (submittedExistingImages !== undefined) {
      setFields.imageUrls = submittedExistingImages;
    }
    delete setFields.existingImageUrls;

    const updatePayload =
      Object.keys(pushFields).length > 0
        ? {
            ...(Object.keys(setFields).length > 0 ? { $set: setFields } : {}),
            $push: pushFields,
          }
        : setFields;

    const updated = await Performance.findByIdAndUpdate(req.params.id, updatePayload, {
      returnDocument: 'after',
      runValidators: true,
    }).select('-__v');

    await writeAuditLog(req, {
      action: 'UPDATE',
      resource: 'Performance',
      resourceId: updated._id,
      before,
      after: updated.toObject(),
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật tiết mục thành công',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/performances/:id/approve
 * Admin duyệt tiết mục: status='published', publishedAt=now, set commission.
 */
exports.approveOne = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tiết mục' });

    if (performance.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Không thể duyệt tiết mục đang ở trạng thái '${performance.status}'. Chỉ duyệt được tiết mục 'pending'.` });
    }

    const { adminCommissionPercentage } = req.body;
    const updateFields = { status: 'published', publishedAt: new Date() };
    if (adminCommissionPercentage !== undefined) {
      updateFields.adminCommissionPercentage = adminCommissionPercentage;
    }

    const updated = await Performance.findByIdAndUpdate(req.params.id, updateFields, {
      returnDocument: 'after',
      runValidators: true,
    }).select('-__v');

    await writeAuditLog(req, {
      action: 'PUBLISH',
      resource: 'Performance',
      resourceId: updated._id,
      before: performance.toObject(),
      after: updated.toObject(),
    });

    res.status(200).json({
      success: true,
      message: 'Tiết mục đã được duyệt và xuất bản thành công.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/performances/:id/reject
 * Admin từ chối tiết mục: status='archived'.
 */
exports.rejectOne = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id);
    if (!performance)
      return res.status(404).json({ success: false, message: 'Không tìm thấy tiết mục' });

    if (performance.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Không thể từ chối tiết mục đang ở trạng thái '${performance.status}'. Chỉ từ chối được tiết mục 'pending'.` });
    }

    const updated = await Performance.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { returnDocument: 'after', runValidators: true },
    ).select('-__v');

    const { rejectReason } = req.body;

    await writeAuditLog(req, {
      action: 'REJECT',
      resource: 'Performance',
      resourceId: updated._id,
      before: performance.toObject(),
      after: { ...updated.toObject(), rejectReason: rejectReason || null },
    });

    res.status(200).json({
      success: true,
      message: 'Tiết mục đã bị từ chối.',
      rejectReason: rejectReason || null,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/performances/:id — Admin only.
 */
exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await Performance.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy tiết mục' });

    await writeAuditLog(req, {
      action: 'DELETE',
      resource: 'Performance',
      resourceId: doc._id,
      before: doc.toObject(),
    });

    res.status(200).json({ success: true, message: 'Xóa tiết mục thành công', data: null });
  } catch (err) {
    next(err);
  }
};
