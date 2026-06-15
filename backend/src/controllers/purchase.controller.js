const CoursePlan = require('../models/CoursePlan');
const Enrollment = require('../models/Enrollment');
const TransactionRecord = require('../models/TransactionRecord');
const Course = require('../models/Course');
const Performance = require('../models/Performance');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Wallet = require('../models/Wallet');
const { hasCourseAccess, hasPerformanceAccess } = require('../utils/access');
const {
  buildPayCode,
  buildSepayQrUrl,
  resolveSepayAccount,
} = require('../config/sepay');
const { sendPaymentSuccessEmail } = require('../services/email.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Hoàn tất 1 giao dịch đã chuyển khoản thành công (dùng chung cho admin-duyệt-tay
 * và webhook SePay tự động). Đặt giao dịch -> success, kích hoạt enrollment,
 * tăng lượt dùng coupon, đánh dấu user đã đăng ký, và chia tiền cho instructor.
 *
 * Idempotent: nếu giao dịch đã 'success' thì return luôn, không xử lý lại.
 * @param {object} transaction - document TransactionRecord (chưa .save())
 * @param {object} [opts] - { reviewedBy, gatewayTxId, gatewayProvider, gatewayResponse }
 */
const fulfillTransaction = async (transaction, opts = {}) => {
  if (transaction.status === 'success') return transaction;

  const now = new Date();
  transaction.status = 'success';
  transaction.paidAt = now;
  if (opts.reviewedBy) {
    transaction.reviewedBy = opts.reviewedBy;
    transaction.reviewedAt = now;
  }
  if (opts.gatewayTxId) transaction.gatewayTxId = opts.gatewayTxId;
  if (opts.gatewayProvider) transaction.gatewayProvider = opts.gatewayProvider;
  if (opts.gatewayResponse) transaction.gatewayResponse = opts.gatewayResponse;

  if (transaction.couponId) {
    await Coupon.findByIdAndUpdate(transaction.couponId, {
      $inc: { usedCount: 1 },
    });
  }

  let instructorId = null;
  let commissionPercentage = 30;
  let itemName = null;

  if (transaction.transactionType === 'course') {
    const course = await Course.findById(transaction.courseId).select(
      'title instructorId adminCommissionPercentage',
    );
    const plan = await CoursePlan.findOne({
      courseId: transaction.courseId,
    }).select('billingCycle');
    if (course) {
      instructorId = course.instructorId;
      commissionPercentage = course.adminCommissionPercentage ?? 30;
      itemName = course.title;
    }
    await Enrollment.findByIdAndUpdate(transaction.enrollmentId, {
      status: 'active',
      isPaid: true,
      startDate: now,
      endDate: calcEndDate(now, plan?.billingCycle || 'monthly'),
    });
  } else if (transaction.transactionType === 'performance') {
    const performance = await Performance.findById(
      transaction.performanceId,
    ).select('title instructorId adminCommissionPercentage');
    if (performance) {
      instructorId = performance.instructorId;
      commissionPercentage = performance.adminCommissionPercentage ?? 30;
      itemName = performance.title;
    }
    await Enrollment.findByIdAndUpdate(transaction.enrollmentId, {
      status: 'active',
      isPaid: true,
      startDate: now,
      endDate: null, // mua đứt
    });
  }

  // Đánh dấu user đã đăng ký (mua) thành công. Không đổi role (chỉ admin/instructor/user).
  const user = await User.findByIdAndUpdate(
    transaction.userId,
    { isSubscribed: true },
    { new: true },
  ).select('name email');

  await transaction.save();

  // Chia tiền cho instructor
  if (instructorId) {
    const instructorShare =
      (transaction.amount * (100 - commissionPercentage)) / 100;
    await Wallet.findOneAndUpdate(
      { instructorId },
      { $inc: { balance: instructorShare, totalEarned: instructorShare } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // Gửi email báo thanh toán thành công (không chặn luồng — service tự nuốt lỗi)
  if (user?.email) {
    await sendPaymentSuccessEmail(user, {
      itemName,
      amount: transaction.amount,
      currency: transaction.currency,
      transactionType: transaction.transactionType,
      transactionId: transaction._id,
    });
  }

  return transaction;
};
exports.fulfillTransaction = fulfillTransaction;

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
  const fail = (msg) => {
    const e = new Error(msg);
    e.statusCode = 400;
    throw e;
  };
  if (!coupon) fail('Invalid or inactive coupon code');

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom)
    fail('Coupon is not yet valid');
  if (coupon.validTo && now > coupon.validTo) fail('Coupon has expired');
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    fail('Coupon usage limit reached');
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

// Lấy tài khoản nhận tiền SePay từ biến môi trường (SEPAY_*).
// Ném 400 nếu chưa cấu hình để FE hiển thị thông báo rõ ràng.
const getSepayAccountOrFail = () => {
  const account = resolveSepayAccount();
  if (!account.accountNumber || !account.bankCode) {
    const e = new Error(
      'Payment account is not configured yet. Please contact admin.',
    );
    e.statusCode = 400;
    throw e;
  }
  return account;
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
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    if (course.isFree)
      return res
        .status(400)
        .json({
          success: false,
          message: 'This course is free. No purchase required.',
        });
    if (course.status !== 'published')
      return res
        .status(400)
        .json({
          success: false,
          message: 'This course is not available for purchase.',
        });

    const plan = await CoursePlan.findOne({ courseId, isActive: true });
    if (!plan)
      return res
        .status(400)
        .json({
          success: false,
          message:
            'No active price plan found for this course. Please contact admin.',
        });

    if (await hasCourseAccess(userId, courseId))
      return res
        .status(400)
        .json({
          success: false,
          message: 'You already have active access to this course.',
        });

    const existingPending = await Enrollment.findOne({
      userId,
      itemType: 'course',
      courseId,
      status: 'pending',
    });
    if (existingPending)
      return res
        .status(400)
        .json({
          success: false,
          message:
            'You already have a pending payment request for this course.',
        });

    const account = getSepayAccountOrFail();
    const { discountAmount, couponId } = await calculateDiscount(
      couponCode,
      plan.price,
      'course',
    );
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
      platform: 'sepay',
    });

    const transaction = await TransactionRecord.create({
      userId,
      enrollmentId: enrollment._id,
      courseId,
      transactionType: 'course',
      amount: finalAmount,
      currency: plan.currency || 'VND',
      paymentMethod: 'sepay',
      status: 'pending',
      couponId,
      discountAmount,
    });

    const payCode = buildPayCode(transaction._id);
    transaction.payCode = payCode;
    await transaction.save();

    res.status(201).json({
      success: true,
      data: {
        message:
          'Payment request created. Scan the SePay QR and transfer — your access is activated automatically.',
        transactionId: transaction._id,
        payCode,
        sepayQrUrl: buildSepayQrUrl(account, finalAmount, payCode),
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
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
    if (!performance)
      return res
        .status(404)
        .json({ success: false, message: 'Performance not found' });
    if (performance.isFree)
      return res
        .status(400)
        .json({
          success: false,
          message: 'This performance is free. No purchase required.',
        });
    if (performance.status !== 'published')
      return res
        .status(400)
        .json({
          success: false,
          message: 'This performance is not available for purchase.',
        });
    if (!performance.price || performance.price <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: 'This performance does not have a valid price.',
        });

    if (await hasPerformanceAccess(userId, performanceId))
      return res
        .status(400)
        .json({
          success: false,
          message: 'You already have access to this performance.',
        });

    const existingPending = await Enrollment.findOne({
      userId,
      itemType: 'performance',
      performanceId,
      status: 'pending',
    });
    if (existingPending)
      return res
        .status(400)
        .json({
          success: false,
          message:
            'You already have a pending payment request for this performance.',
        });

    const account = getSepayAccountOrFail();
    const { discountAmount, couponId } = await calculateDiscount(
      couponCode,
      performance.price,
      'performance',
    );
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
      platform: 'sepay',
    });

    const transaction = await TransactionRecord.create({
      userId,
      enrollmentId: enrollment._id,
      performanceId,
      transactionType: 'performance',
      amount: finalAmount,
      currency: performance.currency || 'VND',
      paymentMethod: 'sepay',
      status: 'pending',
      couponId,
      discountAmount,
    });

    const payCode = buildPayCode(transaction._id);
    transaction.payCode = payCode;
    await transaction.save();

    res.status(201).json({
      success: true,
      data: {
        message:
          'Payment request created. Scan the SePay QR and transfer — your access is activated automatically.',
        transactionId: transaction._id,
        payCode,
        sepayQrUrl: buildSepayQrUrl(account, finalAmount, payCode),
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
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

// ─── Poll trạng thái thanh toán (mobile) ─────────────────────────────────────────

/**
 * GET /api/transaction-records/:id/status
 *
 * Mobile gọi định kỳ sau khi hiện QR để biết SePay đã xác nhận chưa.
 * Trả về trạng thái gọn nhẹ; `isPaid=true` khi giao dịch đã 'success'.
 */
exports.getTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await TransactionRecord.findById(id).select(
      'userId status amount currency payCode paidAt transactionType',
    );
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: 'Transaction not found' });
    if (!transaction.userId.equals(userId))
      return res
        .status(403)
        .json({
          success: false,
          message: 'Forbidden: this transaction does not belong to you',
        });

    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        status: transaction.status,
        isPaid: transaction.status === 'success',
        amount: transaction.amount,
        currency: transaction.currency,
        payCode: transaction.payCode,
        paidAt: transaction.paidAt,
        transactionType: transaction.transactionType,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── User tự hủy yêu cầu thanh toán ──────────────────────────────────────────────

/**
 * PATCH /api/transaction-records/:id/cancel
 *
 * Cho user hủy đơn khi đóng màn QR / bấm "Hủy" hoặc "Xóa" mà chưa chuyển khoản.
 * Chỉ hủy được đơn còn 'pending' (chưa thanh toán). Đơn đã 'success' hoặc đang
 * 'reviewing' (đã nộp minh chứng) thì không cho user tự hủy — tránh hủy nhầm sau khi đã trả tiền.
 */
exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await TransactionRecord.findById(id);
    if (!transaction)
      return res
        .status(404)
        .json({ success: false, message: 'Transaction not found' });
    if (!transaction.userId.equals(userId))
      return res
        .status(403)
        .json({
          success: false,
          message: 'Forbidden: this transaction does not belong to you',
        });
    if (transaction.status !== 'pending')
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot cancel a transaction with status '${transaction.status}'`,
        });

    transaction.status = 'failed';
    transaction.rejectReason = 'Cancelled by user';
    await transaction.save();

    if (transaction.enrollmentId) {
      await Enrollment.findByIdAndUpdate(transaction.enrollmentId, {
        status: 'cancelled',
      });
    }

    await writeAuditLog(req, {
      action: 'CANCEL',
      resource: 'TransactionRecord',
      resourceId: transaction._id,
      after: { status: 'failed', reason: 'cancelled_by_user' },
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Đã hủy yêu cầu thanh toán.',
        transactionId: transaction._id,
      },
    });
  } catch (err) {
    next(err);
  }
};
