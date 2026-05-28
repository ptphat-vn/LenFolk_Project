const axios = require('axios');
const CryptoJS = require('crypto-js');
const config = require('../config/zalopay');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Subscription, UserSubscription } = require('../models/Subscription');
const TransactionRecord = require('../models/TransactionRecord');

// Helper: tính endDate theo billingCycle
const calcEndDate = (startDate, billingCycle) => {
  const end = new Date(startDate);
  if (billingCycle === 'monthly') end.setMonth(end.getMonth() + 1);
  else if (billingCycle === 'quarterly') end.setMonth(end.getMonth() + 3);
  else if (billingCycle === 'yearly') end.setFullYear(end.getFullYear() + 1);
  return end;
};

// Helper: format YYMMDD cho ZaloPay app_trans_id
const formatYYMMDD = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

/**
 * POST /api/subscriptions/:id/purchase
 * User (đã đăng nhập) mua một gói subscription
 * Flow:
 *  1. Tìm subscription plan theo :id
 *  2. Tạo UserSubscription (status: active)
 *  3. Tạo TransactionRecord (status: pending)
 *  4. Gọi ZaloPay API tạo đơn hàng
 *  5. Trả về order_url để client chuyển hướng thanh toán
 */
exports.purchase = catchAsync(async (req, res, next) => {
  const { id: subscriptionId } = req.params;
  const { redirecturl } = req.body;
  const userId = req.user._id;

  // 1. Tìm gói subscription
  const plan = await Subscription.findById(subscriptionId);
  if (!plan) {
    return next(new AppError('Subscription plan not found', 404));
  }
  if (!plan.isActive) {
    return next(new AppError('This subscription plan is no longer available', 400));
  }

  // 2. Tạo UserSubscription
  const startDate = new Date();
  const endDate = calcEndDate(startDate, plan.billingCycle);

  const userSubscription = await UserSubscription.create({
    userId,
    subscriptionId,
    status: 'active',
    startDate,
    endDate,
    autoRenew: false,
    platform: 'zalopay',
  });

  // 3. Tạo TransactionRecord (trạng thái pending, chờ callback)
  const transID = Math.floor(Math.random() * 1000000);
  const appTransId = `${formatYYMMDD()}_${transID}`;

  const transactionRecord = await TransactionRecord.create({
    userId,
    userSubscriptionId: userSubscription._id,
    amount: plan.price,
    currency: plan.currency || 'VND',
    paymentMethod: 'zalopay',
    gatewayTxId: appTransId,
    status: 'pending',
    gatewayProvider: 'zalopay',
  });

  // 4. Tạo đơn hàng ZaloPay
  const embed_data = redirecturl ? { redirecturl } : {};
  const item = [
    {
      itemid: plan._id.toString(),
      itemname: plan.name,
      itemprice: plan.price,
      itemquantity: 1,
    },
  ];

  const order = {
    app_id: config.app_id,
    app_trans_id: appTransId,
    app_user: userId.toString(),
    app_time: Date.now(),
    item: JSON.stringify(item),
    embed_data: JSON.stringify(embed_data),
    amount: plan.price,
    description: `LenFolk - Thanh toán gói ${plan.name} #${transID}`,
    bank_code: 'zalopayapp',
  };

  const data =
    config.app_id +
    '|' +
    order.app_trans_id +
    '|' +
    order.app_user +
    '|' +
    order.amount +
    '|' +
    order.app_time +
    '|' +
    order.embed_data +
    '|' +
    order.item;

  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(config.endpoint, null, { params: order });

    res.status(200).json({
      success: true,
      data: {
        message: 'Order created successfully. Redirect user to order_url to complete payment.',
        transactionRecordId: transactionRecord._id,
        userSubscriptionId: userSubscription._id,
        zalopay: result.data,
      },
    });
  } catch (error) {
    // Nếu ZaloPay lỗi, rollback UserSubscription và TransactionRecord
    await UserSubscription.findByIdAndDelete(userSubscription._id);
    await TransactionRecord.findByIdAndDelete(transactionRecord._id);
    return next(new AppError('Failed to create ZaloPay order. Please try again.', 500));
  }
});
