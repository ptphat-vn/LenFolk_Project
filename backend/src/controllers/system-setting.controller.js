const SystemSetting = require('../models/SystemSetting');
const { writeAuditLog } = require('../utils/audit');

/**
 * GET /api/system-settings — Public.
 * Trả về cấu hình thanh toán dùng chung (QR + bank).
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/system-settings — Admin only.
 * Cập nhật QR (upload file field 'qrCode' → Cloudinary) + thông tin ngân hàng.
 */
exports.updateSettings = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.paymentQrUrl = req.file.path;
    }

    const before = await SystemSetting.getSettings();

    const allowed = [
      'paymentQrUrl',
      'bankName',
      'bankAccountNumber',
      'bankAccountName',
      'transferNote',
      'defaultCommissionPercentage',
    ];
    const update = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });

    const settings = await SystemSetting.findOneAndUpdate(
      { key: 'global' },
      update,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true },
    );

    await writeAuditLog(req, {
      action: 'UPDATE',
      resource: 'SystemSetting',
      resourceId: settings._id,
      before: before.toObject(),
      after: settings.toObject(),
    });

    res.status(200).json({ success: true, message: 'Cập nhật cấu hình hệ thống thành công', data: settings });
  } catch (err) {
    next(err);
  }
};
