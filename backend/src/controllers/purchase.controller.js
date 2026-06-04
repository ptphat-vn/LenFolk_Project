

const { Subscription, UserSubscription } = require('../models/Subscription');
const TransactionRecord = require('../models/TransactionRecord');
const Course = require('../models/Course');
const Performance = require('../models/Performance');
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

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });
  if (!coupon) (() => { const _e = new Error('Invalid or inactive coupon code'); _e.statusCode = 400; throw _e; })();

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom)
    (() => { const _e = new Error('Coupon is not yet valid'); _e.statusCode = 400; throw _e; })();
  if (coupon.validTo && now > coupon.validTo)
    (() => { const _e = new Error('Coupon has expired'); _e.statusCode = 400; throw _e; })();
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    (() => { const _e = new Error('Coupon usage limit reached'); _e.statusCode = 400; throw _e; })();
  if (coupon.applicableTo !== 'all' && coupon.applicableTo !== type)
    (() => { const _e = new Error(`Coupon cannot be applied to ${type}`); _e.statusCode = 400; throw _e; })();

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
exports.requestPayment = async (req, res, next) => {
  try {
  const { id: subscriptionId } = req.params;
  const { couponCode } = req.body;
  const userId = req.user._id;

  const plan = await Subscription.findById(subscriptionId).populate({
    path: 'courseId',
    select: 'isFree title',
  });
  if (!plan) return res.status(404).json({ success: false, message: 'Subscription plan not found' });
  if (!plan.isActive)
    return res.status(400).json({ success: false, message: 'This subscription plan is no longer available' });
  if (!plan.qrCodeUrl)
    return res.status(400).json({ success: false, message: 'This plan does not have a QR code configured yet. Please contact admin.' });
  if (plan.courseId?.isFree)
    return res.status(400).json({ success: false, message: 'This course is free. No subscription required.' });

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
    return res.status(400).json({ success: false, message: 'You already have an active subscription for this course.' });

  const existingPending = await UserSubscription.findOne({
    userId,
    subscriptionId,
    status: 'pending',
  });
  if (existingPending)
    return res.status(400).json({ success: false, message: 'You already have a pending payment request for this plan. Please upload your proof or wait for admin review.' });

  // Tính giảm giá
  const { discountAmount, couponId } = await calculateDiscount(
    couponCode,
    plan.price,
    'subscription',
  );
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
      message:
        'Payment request created. Please scan the QR code, complete the bank transfer, then upload your payment proof.',
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
  } catch (err) { next(err); }
};

/**
 * POST /api/courses/:id/purchase
 * User yêu cầu mua đứt (lifetime) một Khóa học.
 * Giá được lấy từ gói Subscription liên kết với khóa học.
 */
exports.requestCoursePayment = async (req, res, next) => {
  try {
  const { id: courseId } = req.params;
  const { couponCode } = req.body;
  const userId = req.user._id;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  if (course.isFree)
    return res.status(400).json({ success: false, message: 'This course is free. No purchase required.' });
  if (course.status !== 'published')
    return res.status(400).json({ success: false, message: 'This course is not available for purchase.' });

  // Lấy giá từ gói Subscription liên kết
  const plan = await Subscription.findOne({
    itemType: 'course',
    courseId,
    isActive: true,
  });
  if (!plan)
    return res.status(400).json({ success: false, message: 'No active subscription plan found for this course. Please contact admin.' });
  if (!plan.qrCodeUrl)
    return res.status(400).json({ success: false, message: 'This course does not have a QR code configured yet. Please contact admin.' });

  // Kiểm tra user đã có khóa học chưa
  const user = await User.findById(userId);
  if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
    return res.status(400).json({ success: false, message: 'You have already purchased this course.' });
  }

  // Tính giảm giá
  const { discountAmount, couponId } = await calculateDiscount(
    couponCode,
    plan.price,
    'course',
  );
  const finalAmount = plan.price - discountAmount;

  const transactionRecord = await TransactionRecord.create({
    userId,
    courseId,
    transactionType: 'course',
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
      message:
        'Payment request created. Please scan the QR code, complete the bank transfer, then upload your payment proof.',
      transactionId: transactionRecord._id,
      qrCodeUrl: plan.qrCodeUrl,
      originalAmount: plan.price,
      discountAmount,
      amountToPay: finalAmount,
      currency: plan.currency || 'VND',
      courseName: course.title,
    },
  });
  } catch (err) { next(err); }
};

/**
 * POST /api/performances/:id/purchase
 * User yêu cầu truy cập Tiết mục qua gói Subscription liên kết.
 */
exports.requestPerformancePayment = async (req, res, next) => {
  try {
  const { id: performanceId } = req.params;
  const { couponCode } = req.body;
  const userId = req.user._id;

  const performance = await Performance.findById(performanceId);
  if (!performance) return res.status(404).json({ success: false, message: 'Performance not found' });
  if (performance.isFree)
    return res.status(400).json({ success: false, message: 'This performance is free. No purchase required.' });
  if (performance.status !== 'published')
    return res.status(400).json({ success: false, message: 'This performance is not available for purchase.' });

  // Lấy giá từ gói Subscription liên kết
  const plan = await Subscription.findOne({
    itemType: 'performance',
    performanceId,
    isActive: true,
  });
  if (!plan)
    return res.status(400).json({ success: false, message: 'No active subscription plan found for this performance. Please contact admin.' });
  if (!plan.qrCodeUrl)
    return res.status(400).json({ success: false, message: 'This performance does not have a QR code configured yet. Please contact admin.' });

  // Kiểm tra user đã có access chưa (qua subscription đang active)
  const activeSubs = await UserSubscription.find({
    userId,
    status: 'active',
    endDate: { $gt: new Date() },
  }).populate({ path: 'subscriptionId', select: 'performanceId itemType' });

  const alreadyHasAccess = activeSubs.some(
    (sub) =>
      sub.subscriptionId?.itemType === 'performance' &&
      sub.subscriptionId?.performanceId?.toString() ===
        performanceId.toString(),
  );
  if (alreadyHasAccess)
    return res.status(400).json({ success: false, message: 'You already have active access to this performance.' });

  const existingPending = await UserSubscription.findOne({
    userId,
    subscriptionId: plan._id,
    status: 'pending',
  });
  if (existingPending)
    return res.status(400).json({ success: false, message: 'You already have a pending payment request for this performance.' });

  const { discountAmount, couponId } = await calculateDiscount(
    couponCode,
    plan.price,
    'subscription',
  );
  const finalAmount = plan.price - discountAmount;

  const requestedAt = new Date();
  const userSubscription = await UserSubscription.create({
    userId,
    subscriptionId: plan._id,
    status: 'pending',
    startDate: requestedAt,
    endDate: calcEndDate(requestedAt, plan.billingCycle),
    autoRenew: false,
    platform: 'qr_manual',
  });

  const transactionRecord = await TransactionRecord.create({
    userId,
    performanceId,
    userSubscriptionId: userSubscription._id,
    transactionType: 'performance',
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
      message:
        'Payment request created. Please scan the QR code, complete the bank transfer, then upload your payment proof.',
      transactionId: transactionRecord._id,
      qrCodeUrl: plan.qrCodeUrl,
      originalAmount: plan.price,
      discountAmount,
      amountToPay: finalAmount,
      currency: plan.currency || 'VND',
      planName: plan.name,
      performanceName: performance.title,
    },
  });
  } catch (err) { next(err); }
};

exports.uploadProof = async (req, res, next) => {
  try {
  const { id } = req.params;
  const userId = req.user._id;

  if (!req.file)
    return res.status(400).json({ success: false, message: 'Please attach a payment proof image (field: proof)' });

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  if (!transaction.userId.equals(userId))
    return res.status(403).json({ success: false, message: 'Forbidden: this transaction does not belong to you' });
  if (transaction.status !== 'pending')
    return res.status(400).json({ success: false, message: `Cannot upload proof for a transaction with status '${transaction.status}'` });

  transaction.proofImageUrl = req.file.path;
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
  } catch (err) { next(err); }
};

/**
 * PATCH /api/transaction-records/:id/approve
 */
exports.approve = async (req, res, next) => {
  try {
  const { id } = req.params;
  const adminId = req.user._id;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  if (transaction.status !== 'reviewing')
    return res.status(400).json({ success: false, message: `Cannot approve a transaction with status '${transaction.status}'` });

  const now = new Date();
  transaction.status = 'success';
  transaction.paidAt = now;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;

  // Nếu có coupon, tăng usedCount
  if (transaction.couponId) {
    await Coupon.findByIdAndUpdate(transaction.couponId, {
      $inc: { usedCount: 1 },
    });
  }

  let instructorId = null;
  let commissionPercentage = 30;

  if (transaction.transactionType === 'subscription') {
    const userSub = await UserSubscription.findById(
      transaction.userSubscriptionId,
    ).populate({
      path: 'subscriptionId',
      populate: [
        { path: 'courseId', select: 'instructorId adminCommissionPercentage' },
        {
          path: 'performanceId',
          select: 'instructorId adminCommissionPercentage',
        },
      ],
    });
    if (!userSub) return res.status(404).json({ success: false, message: 'UserSubscription not found' });

    const linkedItem =
      userSub.subscriptionId?.itemType === 'performance'
        ? userSub.subscriptionId?.performanceId
        : userSub.subscriptionId?.courseId;

    if (linkedItem) {
      instructorId = linkedItem.instructorId;
      commissionPercentage = linkedItem.adminCommissionPercentage ?? 30;
    }

    const approvedStartDate = now;
    const approvedEndDate = calcEndDate(
      approvedStartDate,
      userSub.subscriptionId?.billingCycle || 'monthly',
    );

    await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, {
      status: 'active',
      startDate: approvedStartDate,
      endDate: approvedEndDate,
    });

    await User.findOneAndUpdate(
      { _id: transaction.userId, role: 'guest' },
      { role: 'learner' },
    );
  } else if (transaction.transactionType === 'course') {
    const course = await Course.findById(transaction.courseId).select(
      'instructorId adminCommissionPercentage',
    );
    if (course) {
      instructorId = course.instructorId;
      commissionPercentage = course.adminCommissionPercentage ?? 30;
    }

    // Kích hoạt khóa học lẻ
    await User.findByIdAndUpdate(transaction.userId, {
      $addToSet: { enrolledCourses: transaction.courseId },
    });
    await User.findOneAndUpdate(
      { _id: transaction.userId, role: 'guest' },
      { role: 'learner' },
    );
  }

  await transaction.save();

  if (instructorId) {
    const instructorShare =
      (transaction.amount * (100 - commissionPercentage)) / 100;
    await Wallet.findOneAndUpdate(
      { instructorId },
      { $inc: { balance: instructorShare, totalEarned: instructorShare } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  res.status(200).json({
    success: true,
    data: {
      message: 'Đã duyệt thanh toán thành công.',
      transactionId: transaction._id,
    },
  });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/transaction-records/:id/reject
 */
exports.reject = async (req, res, next) => {
  try {
  const { id } = req.params;
  const adminId = req.user._id;
  const { rejectReason } = req.body;

  const transaction = await TransactionRecord.findById(id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  if (transaction.status !== 'reviewing')
    return res.status(400).json({ success: false, message: `Cannot reject a transaction with status '${transaction.status}'` });

  const now = new Date();
  transaction.status = 'failed';
  transaction.rejectReason = rejectReason || null;
  transaction.reviewedBy = adminId;
  transaction.reviewedAt = now;
  await transaction.save();

  if (transaction.transactionType === 'subscription') {
    await UserSubscription.findByIdAndUpdate(transaction.userSubscriptionId, {
      status: 'cancelled',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      message: 'Đã từ chối thanh toán.',
      transactionId: transaction._id,
    },
  });
  } catch (err) { next(err); }
};
