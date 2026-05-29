const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Subscription, UserSubscription } = require('../models/Subscription');
const TransactionRecord = require('../models/TransactionRecord');
const Course = require('../models/Course');
const User = require('../models/User');

// Helper: tính endDate theo billingCycle
const calcEndDate = (startDate, billingCycle) => {
  const end = new Date(startDate);
  if (billingCycle === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (billingCycle === 'quarterly') end.setMonth(end.getMonth() + 3);
  else if (billingCycle === 'yearly') end.setFullYear(end.getFullYear() + 1);
  return end;
};

/**
 * POST /api/subscriptions/:id/request
 * User yêu cầu mua gói subscription.
 * Tạo UserSubscription (pending) + TransactionRecord (pending).
 * Trả về qrCodeUrl để user quét mã QR và chuyển khoản.
 */
exports.requestPayment = catchAsync(async (req, res, next) => {
  const { id: subscriptionId } = req.params;
  const userId = req.user._id;

  // 1. Tìm gói subscription và populate thông tin khóa học
  const plan = await Subscription.findById(subscriptionId).populate({
    path: 'courseId',
    select: 'isFree title',
  });
  if (!plan) return next(new AppError('Subscription plan not found', 404));
  if (!plan.isActive)
    return next(
      new AppError('This subscription plan is no longer available', 400),
    );
  if (!plan.qrCodeUrl)
    return next(
      new AppError(
        'This plan does not have a QR code configured yet. Please contact admin.',
        400,
      ),
    );

  // BUG FIX #1: Không cho phép tạo gói cho khóa học miễn phí
  if (plan.courseId?.isFree) {
    return next(
      new AppError('This course is free. No subscription required.', 400),
    );
  }

  // 2. Kiểm tra đã có active subscription cho CÙNG KHÓA HỌC chưa
  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'courseId' });

  const alreadyHasCourse = activeSubs.some(
    (sub) =>
      sub.subscriptionId?.courseId?.toString() === plan.courseId._id.toString(),
  );
  if (alreadyHasCourse)
    return next(
      new AppError(
        'You already have an active subscription for this course.',
        400,
      ),
    );

  // 3. Tránh spam request khi đã có pending chưa xử lý
  const existingPending = await UserSubscription.findOne({
    userId,
    subscriptionId,
    status: 'pending',
  });
  if (existingPending)
    return next(
      new AppError(
        'You already have a pending payment request for this plan. Please upload your proof or wait for admin review.',
        400,
      ),
    );

  // 4. Tạo UserSubscription với startDate/endDate tạm thời (sẽ được recalculate lúc approve)
  //    Đặt startDate = now để giữ dấu mốc thời gian yêu cầu
  const requestedAt = new Date();

  const userSubscription = await UserSubscription.create({
    userId,
    subscriptionId,
    status: 'pending',
    startDate: requestedAt,
    endDate: calcEndDate(requestedAt, plan.billingCycle), // placeholder, sẽ reset lúc approve
    autoRenew: false,
    platform: 'qr_manual',
  });

  // 5. Tạo TransactionRecord (status: pending)
  const transactionRecord = await TransactionRecord.create({
    userId,
    userSubscriptionId: userSubscription._id,
    amount: plan.price,
    currency: plan.currency || 'VND',
    paymentMethod: 'qr_manual',
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    data: {
      message:
        'Payment request created. Please scan the QR code, complete the bank transfer, then upload your payment proof.',
      transactionId: transactionRecord._id,
      qrCodeUrl: plan.qrCodeUrl,
      amount: plan.price,
      currency: plan.currency || 'VND',
      planName: plan.name,
      courseName: plan.courseId?.title ?? null,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/upload-proof
 * User upload ảnh chứng minh thanh toán (multipart field: 'proof').
 * Chuyển trạng thái TransactionRecord: pending → reviewing.
 */
exports.uploadProof = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!req.file)
    return next(
      new AppError('Please attach a payment proof image (field: proof)', 400),
    );

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (!transaction.userId.equals(userId))
    return next(
      new AppError('Forbidden: this transaction does not belong to you', 403),
    );
  if (transaction.status !== 'pending')
    return next(
      new AppError(
        `Cannot upload proof for a transaction with status '${transaction.status}'`,
        400,
      ),
    );

  transaction.proofImageUrl = req.file.path; // Cloudinary URL
  transaction.status = 'reviewing';
  await transaction.save();

  res.status(200).json({
    success: true,
    data: {
      message:
        'Proof uploaded successfully. Your payment is under admin review.',
      transactionId: transaction._id,
      proofImageUrl: transaction.proofImageUrl,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/approve
 * Admin duyệt thanh toán.
 * - TransactionRecord: reviewing → success
 * - UserSubscription: pending → active
 * - User: role guest → learner (nếu cần)
 */
exports.approve = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (transaction.status !== 'reviewing')
    return next(
      new AppError(
        `Cannot approve a transaction with status '${transaction.status}'`,
        400,
      ),
    );

  const now = new Date();

  // BUG FIX #2: Recalculate startDate/endDate at approval time, not at request time.
  // This ensures the subscription period starts when payment is actually confirmed.
  const userSub = await UserSubscription.findById(
    transaction.userSubscriptionId,
  ).populate({ path: 'subscriptionId', select: 'billingCycle' });
  if (!userSub) return next(new AppError('UserSubscription not found', 404));

  const approvedStartDate = now;
  const approvedEndDate = calcEndDate(
    approvedStartDate,
    userSub.subscriptionId?.billingCycle || 'monthly',
  );

  transaction.status = 'success';
  transaction.paidAt = now;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;
  await transaction.save();

  await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, {
    status: 'active',
    startDate: approvedStartDate,
    endDate: approvedEndDate,
  });

  // Nâng role guest → learner (instructor/admin/moderator không bị ảnh hưởng)
  await User.findOneAndUpdate(
    { _id: transaction.userId, role: 'guest' },
    { role: 'learner' },
  );

  res.status(200).json({
    success: true,
    data: {
      message: 'Payment approved. The subscription is now active.',
      transactionId: transaction._id,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/reject
 * Admin từ chối thanh toán.
 * - TransactionRecord: reviewing → failed
 * - UserSubscription: pending → cancelled
 */
exports.reject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const { rejectReason } = req.body;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (transaction.status !== 'reviewing')
    return next(
      new AppError(
        `Cannot reject a transaction with status '${transaction.status}'`,
        400,
      ),
    );

  const now = new Date();

  transaction.status = 'failed';
  transaction.rejectReason = rejectReason || null;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;
  await transaction.save();

  await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, {
    status: 'cancelled',
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Payment rejected.',
      transactionId: transaction._id,
    },
  });
});
