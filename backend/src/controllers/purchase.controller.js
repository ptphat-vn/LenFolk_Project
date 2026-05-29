const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Subscription, UserSubscription } = require('../models/Subscription');
const TransactionRecord = require('../models/TransactionRecord');
const Course = require('../models/Course');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');

// Helper: tính endDate theo billingCycle
const calcEndDate = (startDate, billingCycle) => {
  const end = new Date(startDate);
  if (billingCycle === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (billingCycle === 'quarterly') end.setMonth(end.getMonth() + 3);
  else if (billingCycle === 'yearly') end.setFullYear(end.getFullYear() + 1);
  return end;
};

// Helper: Tính toán giảm giá từ Coupon
const calculateDiscount = async (couponCode, originalPrice, type) => {
  if (!couponCode) return { discountAmount: 0, couponId: null };

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError('Invalid or inactive coupon code', 400);

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) throw new AppError('Coupon is not yet valid', 400);
  if (coupon.validTo && now > coupon.validTo) throw new AppError('Coupon has expired', 400);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new AppError('Coupon usage limit reached', 400);
  if (coupon.applicableTo !== 'all' && coupon.applicableTo !== type) throw new AppError(`Coupon cannot be applied to ${type}`, 400);

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = (originalPrice * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  // Khống chế không giảm quá giá trị gốc
  if (discountAmount > originalPrice) discountAmount = originalPrice;

  return { discountAmount, couponId: coupon._id };
};

/**
 * POST /api/subscriptions/:id/request
 * User yêu cầu mua gói subscription.
 */
exports.requestPayment = catchAsync(async (req, res, next) => {
  const { id: subscriptionId } = req.params;
  const { couponCode } = req.body;
  const userId = req.user._id;

  const plan = await Subscription.findById(subscriptionId).populate({
    path: 'courseId',
    select: 'isFree title',
  });
  if (!plan) return next(new AppError('Subscription plan not found', 404));
  if (!plan.isActive) return next(new AppError('This subscription plan is no longer available', 400));
  if (!plan.qrCodeUrl) return next(new AppError('This plan does not have a QR code configured yet. Please contact admin.', 400));
  if (plan.courseId?.isFree) return next(new AppError('This course is free. No subscription required.', 400));

  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'courseId' });

  const alreadyHasCourse = activeSubs.some(
    (sub) => sub.subscriptionId?.courseId?.toString() === plan.courseId._id.toString(),
  );
  if (alreadyHasCourse) return next(new AppError('You already have an active subscription for this course.', 400));

  const existingPending = await UserSubscription.findOne({
    userId,
    subscriptionId,
    status: 'pending',
  });
  if (existingPending) return next(new AppError('You already have a pending payment request for this plan. Please upload your proof or wait for admin review.', 400));

  // Tính giảm giá
  const { discountAmount, couponId } = await calculateDiscount(couponCode, plan.price, 'subscription');
  const finalAmount = plan.price - discountAmount;

  const requestedAt = new Date();

  const userSubscription = await UserSubscription.create({
    userId,
    subscriptionId,
    status: 'pending',
    startDate: requestedAt,
    endDate: calcEndDate(requestedAt, plan.billingCycle),
    autoRenew: false,
    platform: 'qr_manual',
  });

  const transactionRecord = await TransactionRecord.create({
    userId,
    userSubscriptionId: userSubscription._id,
    transactionType: 'subscription',
    amount: finalAmount,
    currency: plan.currency || 'VND',
    paymentMethod: 'qr_manual',
    status: 'pending',
    couponId,
    discountAmount,
  });

  res.status(201).json({
    success: true,
    data: {
      message: 'Payment request created. Please scan the QR code, complete the bank transfer, then upload your payment proof.',
      transactionId: transactionRecord._id,
      qrCodeUrl: plan.qrCodeUrl,
      originalAmount: plan.price,
      discountAmount,
      amountToPay: finalAmount,
      currency: plan.currency || 'VND',
      planName: plan.name,
      courseName: plan.courseId?.title ?? null,
    },
  });
});

/**
 * POST /api/courses/:id/purchase
 * User yêu cầu mua đứt (lifetime) một Khóa học/Tiết mục.
 */
exports.requestCoursePayment = catchAsync(async (req, res, next) => {
  const { id: courseId } = req.params;
  const { couponCode } = req.body;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) return next(new AppError('Course not found', 404));
  if (course.isFree) return next(new AppError('This course is free. No purchase required.', 400));
  if (course.status !== 'published') return next(new AppError('This course is not available for purchase.', 400));

  // Xem admin có cấu hình mã QR mặc định chung ở đâu không, tạm thời lấy một thông báo hoặc admin cần upload thủ công
  // Vì Course không có trường qrCodeUrl, ta giả định Admin sẽ cung cấp 1 mã QR chung cho nền tảng.
  // Ở đây trả về hướng dẫn thanh toán.
  
  // Kiểm tra user đã có khóa học chưa
  const user = await User.findById(userId);
  if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
    return next(new AppError('You have already purchased this course.', 400));
  }

  // Tính giảm giá
  const { discountAmount, couponId } = await calculateDiscount(couponCode, course.price, 'course');
  const finalAmount = course.price - discountAmount;

  const transactionRecord = await TransactionRecord.create({
    userId,
    courseId,
    transactionType: 'course',
    amount: finalAmount,
    currency: 'VND', // Mặc định
    paymentMethod: 'qr_manual',
    status: 'pending',
    couponId,
    discountAmount,
  });

  res.status(201).json({
    success: true,
    data: {
      message: 'Payment request created. Please complete the bank transfer and upload your payment proof.',
      transactionId: transactionRecord._id,
      originalAmount: course.price,
      discountAmount,
      amountToPay: finalAmount,
      currency: 'VND',
      courseName: course.title,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/upload-proof
 */
exports.uploadProof = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!req.file) return next(new AppError('Please attach a payment proof image (field: proof)', 400));

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (!transaction.userId.equals(userId)) return next(new AppError('Forbidden: this transaction does not belong to you', 403));
  if (transaction.status !== 'pending') return next(new AppError(`Cannot upload proof for a transaction with status '${transaction.status}'`, 400));

  transaction.proofImageUrl = req.file.path;
  transaction.status = 'reviewing';
  await transaction.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Proof uploaded successfully. Your payment is under admin review.',
      transactionId: transaction._id,
      proofImageUrl: transaction.proofImageUrl,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/approve
 */
exports.approve = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (transaction.status !== 'reviewing') return next(new AppError(`Cannot approve a transaction with status '${transaction.status}'`, 400));

  const now = new Date();
  transaction.status = 'success';
  transaction.paidAt = now;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;

  // Nếu có coupon, tăng usedCount
  if (transaction.couponId) {
    await Coupon.findByIdAndUpdate(transaction.couponId, { $inc: { usedCount: 1 } });
  }

  let instructorId = null;
  let commissionPercentage = 30;

  if (transaction.transactionType === 'subscription') {
    const userSub = await UserSubscription.findById(transaction.userSubscriptionId).populate({ 
      path: 'subscriptionId', 
      populate: { path: 'courseId', select: 'instructorId adminCommissionPercentage' } 
    });
    if (!userSub) return next(new AppError('UserSubscription not found', 404));

    if (userSub.subscriptionId?.courseId) {
      instructorId = userSub.subscriptionId.courseId.instructorId;
      commissionPercentage = userSub.subscriptionId.courseId.adminCommissionPercentage ?? 30;
    }

    const approvedStartDate = now;
    const approvedEndDate = calcEndDate(approvedStartDate, userSub.subscriptionId?.billingCycle || 'monthly');

    await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, {
      status: 'active',
      startDate: approvedStartDate,
      endDate: approvedEndDate,
    });

    await User.findOneAndUpdate({ _id: transaction.userId, role: 'guest' }, { role: 'learner' });

  } else if (transaction.transactionType === 'course') {
    const course = await Course.findById(transaction.courseId).select('instructorId adminCommissionPercentage');
    if (course) {
      instructorId = course.instructorId;
      commissionPercentage = course.adminCommissionPercentage ?? 30;
    }

    // Kích hoạt khóa học lẻ
    await User.findByIdAndUpdate(transaction.userId, {
      $addToSet: { enrolledCourses: transaction.courseId },
    });
    await User.findOneAndUpdate({ _id: transaction.userId, role: 'guest' }, { role: 'learner' });
  }

  await transaction.save();

  if (instructorId) {
    const instructorShare = (transaction.amount * (100 - commissionPercentage)) / 100;
    await Wallet.findOneAndUpdate(
      { instructorId },
      { $inc: { balance: instructorShare, totalEarned: instructorShare } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.status(200).json({
    success: true,
    data: {
      message: 'Payment approved successfully.',
      transactionId: transaction._id,
    },
  });
});

/**
 * PATCH /api/transaction-records/:id/reject
 */
exports.reject = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;
  const { rejectReason } = req.body;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return next(new AppError('Transaction not found', 404));
  if (transaction.status !== 'reviewing') return next(new AppError(`Cannot reject a transaction with status '${transaction.status}'`, 400));

  const now = new Date();
  transaction.status = 'failed';
  transaction.rejectReason = rejectReason || null;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;
  await transaction.save();

  if (transaction.transactionType === 'subscription') {
    await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, { status: 'cancelled' });
  }

  res.status(200).json({
    success: true,
    data: {
      message: 'Payment rejected.',
      transactionId: transaction._id,
    },
  });
});
