const mongoose = require('mongoose');

/**
 * SystemSetting — cấu hình hệ thống dạng singleton (chỉ 1 bản ghi).
 * Giữ thông tin thanh toán dùng chung: 1 mã QR cố định + tài khoản ngân hàng.
 * Đọc qua SystemSetting.getSettings(); ghi qua PUT /api/system-settings (admin).
 */
const systemSettingSchema = new mongoose.Schema(
  {
    // Khóa cố định để đảm bảo duy nhất 1 document
    key: {
      type: String,
      default: 'global',
      unique: true,
      immutable: true,
    },
    // URL ảnh QR cố định trên Cloudinary
    paymentQrUrl: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    bankAccountNumber: {
      type: String,
      default: null,
    },
    bankAccountName: {
      type: String,
      default: null,
    },
    // Nội dung chuyển khoản gợi ý (vd: "LENFOLK {transactionId}")
    transferNote: {
      type: String,
      default: null,
    },
    // % hoa hồng mặc định nếu item chưa set riêng
    defaultCommissionPercentage: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

// Lấy (hoặc tạo) bản ghi singleton
systemSettingSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
