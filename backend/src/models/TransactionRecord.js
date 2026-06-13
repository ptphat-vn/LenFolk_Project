const mongoose = require('mongoose');

const transactionRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false,
    },
    performanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Performance',
      required: false,
    },
    transactionType: {
      type: String,
      enum: ['subscription', 'course', 'performance'],
      default: 'subscription',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['VND', 'USD'],
      default: 'VND',
    },
    paymentMethod: {
      type: String,
      required: true,
      comment: 'e.g. qr_manual, sepay, momo',
    },
    gatewayTxId: {
      type: String,
      default: null,
      comment: 'Transaction ID from payment gateway',
    },
    // Mã thanh toán nhúng trong nội dung chuyển khoản (vd "LF1A2B3C4D") để khớp webhook SePay
    payCode: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    gatewayProvider: {
      type: String,
      default: null,
      comment: 'e.g. stripe, momo, apple, google',
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

transactionRecordSchema.index({ userId: 1 });
transactionRecordSchema.index({ userId: 1, status: 1 });
transactionRecordSchema.index({ enrollmentId: 1 });
transactionRecordSchema.index({ gatewayTxId: 1 });
transactionRecordSchema.index({ payCode: 1 });
transactionRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TransactionRecord', transactionRecordSchema);
