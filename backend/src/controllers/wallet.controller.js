const Wallet = require('../models/Wallet');
const PayoutRequest = require('../models/PayoutRequest');
const InstructorProfile = require('../models/InstructorProfile');
const mongoose = require('mongoose');

/**
 * GET /api/wallets/me
 * Xem thông tin ví và lịch sử rút tiền của giảng viên
 */
exports.getMyWallet = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let wallet = await Wallet.findOne({ instructorId: userId });
    if (!wallet) {
      wallet = await Wallet.create({ instructorId: userId });
    }

    const payouts = await PayoutRequest.find({ instructorId: userId }).sort(
      '-createdAt',
    );

    res.status(200).json({
      success: true,
      data: {
        wallet,
        payouts,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/wallets/bank-info
 * Cập nhật thông tin ngân hàng trong InstructorProfile
 */
exports.updateBankInfo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bankName, accountName, accountNumber } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Please provide bankName, accountName and accountNumber',
        });
    }

    let profile = await InstructorProfile.findOne({ userId });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Instructor profile not found' });
    }

    profile.bankDetails = { bankName, accountName, accountNumber };
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin ngân hàng thành công',
      data: profile.bankDetails,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/wallets/payout
 * Tạo yêu cầu rút tiền (Giảng viên)
 */
exports.requestPayout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    if (!amount || amount < 100000) {
      return res
        .status(400)
        .json({ success: false, message: 'Minimum payout amount is 100,000' });
    }

    // Check if bank info exists
    const profile = await InstructorProfile.findOne({ userId });
    if (!profile || !profile.bankDetails || !profile.bankDetails.bankName) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Please update your bank details before requesting a payout',
        });
    }

    // Check for pending requests to avoid double requests
    const existingPending = await PayoutRequest.findOne({
      instructorId: userId,
      status: 'pending',
    });
    if (existingPending) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'You already have a pending payout request',
        });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let wallet = await Wallet.findOne({ instructorId: userId }).session(
        session,
      );
      if (!wallet || wallet.balance < amount) {
        (() => {
          const _e = new Error('Insufficient balance');
          _e.statusCode = 400;
          throw _e;
        })();
      }

      // Deduct balance
      wallet.balance -= amount;
      await wallet.save({ session });

      // Create payout request
      const payout = await PayoutRequest.create(
        [
          {
            instructorId: userId,
            amount,
            bankDetails: profile.bankDetails,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Đã gửi yêu cầu rút tiền thành công',
        data: payout[0],
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/wallets/admin/payouts
 * Admin xem danh sách yêu cầu rút tiền
 */
exports.getAllPayouts = async (req, res, next) => {
  try {
    const payouts = await PayoutRequest.find()
      .populate('instructorId', 'name email')
      .sort('-createdAt');
    res.status(200).json({
      success: true,
      results: payouts.length,
      data: payouts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/wallets/admin/payouts/:id
 * Admin duyệt hoặc từ chối yêu cầu rút tiền
 */
exports.processPayout = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Status must be approved or rejected',
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payout = await PayoutRequest.findById(req.params.id).session(
        session,
      );

      if (!payout)
        (() => {
          const _e = new Error('Payout request not found');
          _e.statusCode = 404;
          throw _e;
        })();
      if (payout.status !== 'pending')
        (() => {
          const _e = new Error(`Cannot process a ${payout.status} request`);
          _e.statusCode = 400;
          throw _e;
        })();

      payout.status = status;
      payout.adminNote = adminNote || null;
      payout.processedBy = req.user._id;
      payout.processedAt = new Date();

      // Nếu từ chối, hoàn tiền lại ví
      if (status === 'rejected') {
        await Wallet.findOneAndUpdate(
          { instructorId: payout.instructorId },
          { $inc: { balance: payout.amount } },
          { session },
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
  } catch (err) {
    next(err);
  }
};
