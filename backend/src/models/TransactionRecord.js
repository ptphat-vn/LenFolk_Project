const mongoose = require('mongoose')

const transactionRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSubscription',
      required: true,
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
      comment: 'e.g. credit_card, momo, zalopay, apple_pay',
    },
    gatewayTxId: {
      type: String,
      default: null,
      comment: 'Transaction ID from payment gateway',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    gatewayProvider: {
      type: String,
      default: null,
      comment: 'e.g. stripe, momo, zalopay, apple, google',
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
  },
  { timestamps: true }
)

transactionRecordSchema.index({ userId: 1 })
transactionRecordSchema.index({ userId: 1, status: 1 })
transactionRecordSchema.index({ userSubscriptionId: 1 })
transactionRecordSchema.index({ gatewayTxId: 1 })
transactionRecordSchema.index({ createdAt: -1 })

module.exports = mongoose.model('TransactionRecord', transactionRecordSchema)
