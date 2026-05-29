const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Wallet = require('../models/Wallet');
const PayoutRequest = require('../models/PayoutRequest');
const InstructorProfile = require('../models/InstructorProfile');
const mongoose = require('mongoose');

/**
 * GET /api/wallets/me
 * Xem thông tin ví và lịch sử rút tiền của giảng viên
 */
exports.getMyWallet = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  let wallet = await Wallet.findOne({ instructorId: userId });
  if (!wallet) {
    wallet = await Wallet.create({ instructorId: userId });
  }

  const payouts = await PayoutRequest.find({ instructorId: userId }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      wallet,
      payouts,
    },
  });
});

/**
 * PUT /api/wallets/bank-info
 * Cập nhật thông tin ngân hàng trong InstructorProfile
 */
exports.updateBankInfo = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bankName, accountName, accountNumber } = req.body;

  if (!bankName || !accountName || !accountNumber) {
    return next(new AppError('Please provide bankName, accountName and accountNumber', 400));
  }

  let profile = await InstructorProfile.findOne({ userId });
  if (!profile) {
    return next(new AppError('Instructor profile not found', 404));
  }

  profile.bankDetails = { bankName, accountName, accountNumber };
  await profile.save();

  res.status(200).json({
    success: true,
    data: profile.bankDetails,
  });
});

/**
 * POST /api/wallets/payout
 * Tạo yêu cầu rút tiền (Giảng viên)
 */
exports.requestPayout = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { amount } = req.body;

  if (!amount || amount < 100000) {
    return next(new AppError('Minimum payout amount is 100,000', 400));
  }

  // Check if bank info exists
  const profile = await InstructorProfile.findOne({ userId });
  if (!profile || !profile.bankDetails || !profile.bankDetails.bankName) {
    return next(new AppError('Please update your bank details before requesting a payout', 400));
  }

  // Check for pending requests to avoid double requests
  const existingPending = await PayoutRequest.findOne({ instructorId: userId, status: 'pending' });
  if (existingPending) {
    return next(new AppError('You already have a pending payout request', 400));
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let wallet = await Wallet.findOne({ instructorId: userId }).session(session);
    if (!wallet || wallet.balance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Deduct balance
    wallet.balance -= amount;
    await wallet.save({ session });

    // Create payout request
    const payout = await PayoutRequest.create([{
      instructorId: userId,
      amount,
      bankDetails: profile.bankDetails,
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      data: payout[0],
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

/**
 * GET /api/wallets/admin/payouts
 * Admin xem danh sách yêu cầu rút tiền
 */
exports.getAllPayouts = catchAsync(async (req, res, next) => {
  const payouts = await PayoutRequest.find().populate('instructorId', 'name email').sort('-createdAt');
  res.status(200).json({
    success: true,
    results: payouts.length,
    data: payouts,
  });
});

/**
 * PATCH /api/wallets/admin/payouts/:id
 * Admin duyệt hoặc từ chối yêu cầu rút tiền
 */
exports.processPayout = catchAsync(async (req, res, next) => {
  const { status, adminNote } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Status must be approved or rejected', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payout = await PayoutRequest.findById(req.params.id).session(session);
    
    if (!payout) throw new AppError('Payout request not found', 404);
    if (payout.status !== 'pending') throw new AppError(`Cannot process a ${payout.status} request`, 400);

    payout.status = status;
    payout.adminNote = adminNote || null;
    payout.processedBy = req.user._id;
    payout.processedAt = new Date();

    // Nếu từ chối, hoàn tiền lại ví
    if (status === 'rejected') {
      await Wallet.findOneAndUpdate(
        { instructorId: payout.instructorId },
        { $inc: { balance: payout.amount } },
        { session }
      );
    }

    await payout.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: payout,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
