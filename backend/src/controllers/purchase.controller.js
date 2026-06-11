const CoursePlan = require('../models/CoursePlan');
const Enrollment = require('../models/Enrollment');
const TransactionRecord = require('../models/TransactionRecord');
const Course = require('../models/Course');
const Performance = require('../models/Performance');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');
const SystemSetting = require('../models/SystemSetting');
const { hasCourseAccess, hasPerformanceAccess } = require('../utils/access');
const { writeAuditLog } = require('../utils/audit');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Tính endDate cho course theo billingCycle
const calcEndDate = (startDate, billingCycle) => {
  const end = new Date(startDate);
  if (billingCycle === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (billingCycle === 'quarterly') end.setMonth(end.getMonth() + 3);
  else if (billingCycle === 'yearly') end.setFullYear(end.getFullYear() + 1);
  return end;
};

// Tính giảm giá từ Coupon
const calculateDiscount = async (couponCode, originalPrice, type) => {
  if (!couponCode) return { discountAmount: 0, couponId: null };

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });
  const fail = (msg) => { const e = new Error(msg); e.statusCode = 400; throw e; };
  if (!coupon) fail('Invalid or inactive coupon code');

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) fail('Coupon is not yet valid');
  if (coupon.validTo && now > coupon.validTo) fail('Coupon has expired');
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) fail('Coupon usage limit reached');
  if (coupon.applicableTo !== 'all' && coupon.applicableTo !== type)
    fail(`Coupon cannot be applied to ${type}`);

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = (originalPrice * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }
  if (discountAmount > originalPrice) discountAmount = originalPrice;

  return { discountAmount, couponId: coupon._id };
};

// Lấy thông tin thanh toán dùng chung (QR cố định + bank)
const getPaymentInfo = async () => {
  const settings = await SystemSetting.getSettings();
  return {
    qrCodeUrl: settings.paymentQrUrl,
    bankName: settings.bankName,
    bankAccountNumber: settings.bankAccountNumber,
    bankAccountName: settings.bankAccountName,
    transferNote: settings.transferNote,
  };
};

// ─── Mua KHÓA HỌC (theo chu kỳ) ────────────────────────────────────────────────

/**
 * POST /api/courses/:id/purchase
 * Giá lấy từ CoursePlan liên kết. Tạo Enrollment(course) pending + TransactionRecord.
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

    const plan = await CoursePlan.findOne({ courseId, isActive: true });
    if (!plan)
      return res.status(400).json({ success: false, message: 'No active price plan found for this course. Please contact admin.' });

    const payment = await getPaymentInfo();
    if (!payment.qrCodeUrl)
      return res.status(400).json({ success: false, message: 'Payment QR is not configured yet. Please contact admin.' });

    if (await hasCourseAccess(userId, courseId))
      return res.status(400).json({ success: false, message: 'You already have active access to this course.' });

    const existingPending = await Enrollment.findOne({
      userId, itemType: 'course', courseId, status: 'pending',
    });
    if (existingPending)
      return res.status(400).json({ success: false, message: 'You already have a pending payment request for this course.' });

    const { discountAmount, couponId } = await calculateDiscount(couponCode, plan.price, 'course');
    const finalAmount = plan.price - discountAmount;
    const now = new Date();

    const enrollment = await Enrollment.create({
      userId,
      itemType: 'course',
      courseId,
      coursePlanId: plan._id,
      status: 'pending',
      isPaid: false,
      startDate: now,
      endDate: calcEndDate(now, plan.billingCycle),
      platform: 'qr_manual',
    });

    const transaction = await TransactionRecord.create({
      userId,
      enrollmentId: enrollment._id,
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
        message: 'Payment request created. Scan the QR, transfer, then upload your proof.',
        transactionId: transaction._id,
        ...payment,
        originalAmount: plan.price,
        discountAmount,
        amountToPay: finalAmount,
        currency: plan.currency || 'VND',
        courseName: course.title,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Mua TIẾT MỤC (mua đứt) ─────────────────────────────────────────────────────

/**
 * POST /api/performances/:id/purchase
 * Giá lấy thẳng từ performance.price. Tạo Enrollment(performance) pending + TransactionRecord.
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
    if (!performance.price || performance.price <= 0)
      return res.status(400).json({ success: false, message: 'This performance does not have a valid price.' });

    const payment = await getPaymentInfo();
    if (!payment.qrCodeUrl)
      return res.status(400).json({ success: false, message: 'Payment QR is not configured yet. Please contact admin.' });

    if (await hasPerformanceAccess(userId, performanceId))
      return res.status(400).json({ success: false, message: 'You already have access to this performance.' });

    const existingPending = await Enrollment.findOne({
      userId, itemType: 'performance', performanceId, status: 'pending',
    });
    if (existingPending)
      return res.status(400).json({ success: false, message: 'You already have a pending payment request for this performance.' });

    const { discountAmount, couponId } = await calculateDiscount(couponCode, performance.price, 'performance');
    const finalAmount = performance.price - discountAmount;
    const now = new Date();

    const enrollment = await Enrollment.create({
      userId,
      itemType: 'performance',
      performanceId,
      status: 'pending',
      isPaid: false,
      startDate: now,
      endDate: null, // mua đứt vĩnh viễn
      platform: 'qr_manual',
    });

    const transaction = await TransactionRecord.create({
      userId,
      enrollmentId: enrollment._id,
      performanceId,
      transactionType: 'performance',
      amount: finalAmount,
      currency: performance.currency || 'VND',
      paymentMethod: 'qr_manual',
      status: 'pending',
      couponId,
      discountAmount,
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Payment request created. Scan the QR, transfer, then upload your proof.',
        transactionId: transaction._id,
        ...payment,
        originalAmount: performance.price,
        discountAmount,
        amountToPay: finalAmount,
        currency: performance.currency || 'VND',
        performanceName: performance.title,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Upload minh chứng ──────────────────────────────────────────────────────────

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
        message: 'Proof uploaded successfully. Your payment is under admin review.',
        transactionId: transaction._id,
        proofImageUrl: transaction.proofImageUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin duyệt / từ chối ──────────────────────────────────────────────────────

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

    if (transaction.couponId) {
      await Coupon.findByIdAndUpdate(transaction.couponId, { $inc: { usedCount: 1 } });
    }

    let instructorId = null;
    let commissionPercentage = 30;

    if (transaction.transactionType === 'course') {
      const course = await Course.findById(transaction.courseId).select('instructorId adminCommissionPercentage');
      const plan = await CoursePlan.findOne({ courseId: transaction.courseId }).select('billingCycle');
      if (course) {
        instructorId = course.instructorId;
        commissionPercentage = course.adminCommissionPercentage ?? 30;
      }
      await Enrollment.findByIdAndUpdate(transaction.enrollmentId, {
        status: 'active',
        isPaid: true,
        startDate: now,
        endDate: calcEndDate(now, plan?.billingCycle || 'monthly'),
      });
    } else if (transaction.transactionType === 'performance') {
      const performance = await Performance.findById(transaction.performanceId).select('instructorId adminCommissionPercentage');
      if (performance) {
        instructorId = performance.instructorId;
        commissionPercentage = performance.adminCommissionPercentage ?? 30;
      }
      await Enrollment.findByIdAndUpdate(transaction.enrollmentId, {
        status: 'active',
        isPaid: true,
        startDate: now,
        endDate: null, // mua đứt
      });
    }

    // Đánh dấu user đã đăng ký (mua) thành công. Không đổi role (chỉ admin/instructor/user).
    await User.findByIdAndUpdate(transaction.userId, { isSubscribed: true });

    await transaction.save();

    // Chia tiền cho instructor
    if (instructorId) {
      const instructorShare = (transaction.amount * (100 - commissionPercentage)) / 100;
      await Wallet.findOneAndUpdate(
        { instructorId },
        { $inc: { balance: instructorShare, totalEarned: instructorShare } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    await writeAuditLog(req, {
      action: 'APPROVE',
      resource: 'TransactionRecord',
      resourceId: transaction._id,
      after: { status: 'success', amount: transaction.amount, type: transaction.transactionType },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Đã duyệt thanh toán thành công.', transactionId: transaction._id },
    });
  } catch (err) {
    next(err);
  }
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

    if (transaction.enrollmentId) {
      await Enrollment.findByIdAndUpdate(transaction.enrollmentId, { status: 'cancelled' });
    }

    await writeAuditLog(req, {
      action: 'REJECT',
      resource: 'TransactionRecord',
      resourceId: transaction._id,
      after: { status: 'failed', rejectReason: rejectReason || null },
    });

    res.status(200).json({
      success: true,
      data: { message: 'Đã từ chối thanh toán.', transactionId: transaction._id },
    });
  } catch (err) {
    next(err);
  }
};
