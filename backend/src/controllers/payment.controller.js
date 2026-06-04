const axios = require('axios');
const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');
const config = require('../config/zalopay');

const User = require('../models/User');
const TransactionRecord = require('../models/TransactionRecord');
const { UserSubscription } = require('../models/Subscription');

// We use crypto instead of moment to reduce dependencies if possible, but let's just use built-in JS Date.
// Wait, I didn't install moment. I'll just use simple date formatting.
const formatYYMMDD = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, item, description, redirecturl } = req.body;
    const transID = Math.floor(Math.random() * 1000000);

    // Dành cho Mobile App: truyền redirecturl để ZaloPay quay lại app sau khi thanh toán
    const embed_data = redirecturl ? { redirecturl } : {};

    const order = {
      app_id: config.app_id,
      app_trans_id: `${formatYYMMDD()}_${transID}`,
      app_user: req.user ? req.user.id : 'user123',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(item || []),
      embed_data: JSON.stringify(embed_data),
      amount: amount || 50000,
      description: description || `LenFolk - Payment for the order #${transID}`,
      bank_code: 'zalopayapp', // Mặc định mở ZaloPay App
    };

    // app_id + "|" + app_trans_id + "|" + app_user + "|" + amount + "|" + app_time + "|" + embed_data + "|" + item
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
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Payment creation failed' });
    }
  } catch (err) {
    next(err);
  }
};

exports.callback = async (req, res, next) => {
  try {
    let result = {};

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

      // Kiểm tra chữ ký MAC
      if (reqMac !== mac) {
        result.return_code = -1;
        result.return_message = 'mac not equal';
      } else {
        // Callback hợp lệ — thanh toán thành công
        let dataJson = JSON.parse(dataStr);
        const appTransId = dataJson['app_trans_id'];

        // 1. Tìm TransactionRecord theo gatewayTxId
        const transaction = await TransactionRecord.findOne({
          gatewayTxId: appTransId,
        });

        if (transaction) {
          // Idempotency guard: bỏ qua nếu đã xử lý (ZaloPay có thể retry)
          if (transaction.status === 'success') {
            result.return_code = 1;
            result.return_message = 'success';
            return res.json(result);
          }

          // Atomic: dùng mongoose session để đảm bảo tất cả 3 bước hoặc không có bước nào
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            // 2. Cập nhật TransactionRecord → success
            transaction.status = 'success';
            transaction.paidAt = new Date();
            transaction.gatewayResponse = dataJson;
            await transaction.save({ session });

            // 3. Kích hoạt UserSubscription
            const updatedUserSub = await UserSubscription.findByIdAndUpdate(
              transaction.userSubscriptionId,
              { status: 'active' },
              { new: true, session },
            );

            // 4. Nâng role User và cập nhật currentSubscription → UserSubscription (có endDate)
            if (updatedUserSub) {
              await User.findByIdAndUpdate(
                transaction.userId,
                {
                  role: 'learner',
                  currentSubscription: updatedUserSub._id,
                },
                { session },
              );
            }

            await session.commitTransaction();
          } catch (txErr) {
            await session.abortTransaction();
            throw txErr;
          } finally {
            session.endSession();
          }
        }

        result.return_code = 1;
        result.return_message = 'success';
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ retry (tối đa 3 lần)
      result.return_message = ex.message;
    }

    // Phản hồi về ZaloPay server
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.checkOrderStatus = async (req, res, next) => {
  try {
    const { app_trans_id } = req.body;

    let postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id,
    };

    let data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1; // app_id|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    let postConfig = {
      method: 'post',
      url: config.query_endpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams(postData).toString(),
    };

    try {
      const result = await axios(postConfig);
      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Payment check failed' });
    }
  } catch (err) {
    next(err);
  }
};
