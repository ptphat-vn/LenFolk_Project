const TransactionRecord = require('../models/TransactionRecord');
const { fulfillTransaction } = require('./purchase.controller');
const { extractPayCode } = require('../config/sepay');
const config = require('../config');
const logger = require('../config/logger');

/**
 * POST /api/payments/sepay/webhook  (PUBLIC — không qua verifyToken)
 *
 * SePay gọi endpoint này mỗi khi có biến động số dư. Payload mẫu:
 * {
 *   "id": 92704,                       // mã giao dịch trên SePay
 *   "gateway": "Vietcombank",
 *   "transactionDate": "2023-03-25 14:02:37",
 *   "accountNumber": "0123499999",
 *   "code": null,                      // mã thanh toán SePay tự tách (nếu có cấu hình)
 *   "content": "...LF1A2B3C4D...",     // nội dung chuyển khoản
 *   "transferType": "in",              // "in" = tiền vào
 *   "transferAmount": 199000,
 *   "referenceCode": "MBVCB.3278907687",
 *   ...
 * }
 *
 * Bảo mật: SePay gửi header `Authorization: Apikey <KEY>` — ta đối chiếu với
 * SEPAY_WEBHOOK_API_KEY. Luôn trả 200 cho các case đã xử lý để SePay không retry.
 */
exports.webhook = async (req, res) => {
  try {
    // 1) Xác thực Api Key
    const expected = config.sepay.webhookApiKey;
    if (expected) {
      const header = req.headers['authorization'] || '';
      const provided = header.replace(/^Apikey\s+/i, '').trim();
      if (provided !== expected) {
        logger.warn('[SePay] Webhook rejected: invalid Api Key');
        return res.status(401).json({ success: false, message: 'Api Key không hợp lệ' });
      }
    }

    const payload = req.body || {};

    // 2) Chỉ xử lý tiền vào
    if (payload.transferType && payload.transferType !== 'in') {
      return res.status(200).json({ success: true, message: 'Bỏ qua (không phải giao dịch tiền vào)' });
    }

    // 3) Tách mã thanh toán từ content (hoặc trường code SePay đã tách sẵn)
    const payCode = extractPayCode(payload.code) || extractPayCode(payload.content);
    if (!payCode) {
      logger.info(`[SePay] No payCode found in content: "${payload.content}"`);
      return res.status(200).json({ success: true, message: 'Không tìm thấy mã thanh toán phù hợp' });
    }

    // 4) Khớp giao dịch
    const transaction = await TransactionRecord.findOne({ payCode });
    if (!transaction) {
      logger.warn(`[SePay] payCode ${payCode} not matched to any transaction`);
      return res.status(200).json({ success: true, message: 'Không tìm thấy giao dịch' });
    }

    // 5) Idempotent — đã xử lý rồi thì bỏ qua
    if (transaction.status === 'success') {
      return res.status(200).json({ success: true, message: 'Giao dịch đã được xử lý trước đó' });
    }
    if (transaction.status !== 'pending') {
      logger.warn(`[SePay] payCode ${payCode} in non-payable status '${transaction.status}'`);
      return res.status(200).json({ success: true, message: `Bỏ qua (trạng thái ${transaction.status})` });
    }

    // 6) Đối chiếu số tiền (chống chuyển thiếu)
    const paidAmount = Number(payload.transferAmount) || 0;
    if (paidAmount < transaction.amount) {
      logger.warn(`[SePay] ${payCode}: underpaid ${paidAmount}/${transaction.amount}`);
      return res.status(200).json({ success: true, message: 'Số tiền không khớp (chuyển thiếu)' });
    }

    // 7) Hoàn tất giao dịch (kích hoạt enrollment, chia tiền instructor...)
    await fulfillTransaction(transaction, {
      gatewayProvider: 'sepay',
      gatewayTxId: payload.id ? String(payload.id) : payload.referenceCode || null,
      gatewayResponse: payload,
    });

    logger.info(`[SePay] ✅ Fulfilled transaction ${transaction._id} via payCode ${payCode}`);
    return res.status(200).json({ success: true, message: 'Đã xác nhận thanh toán' });
  } catch (err) {
    logger.error('[SePay] Webhook error', err);
    // Trả 200 để SePay không retry vô hạn; lỗi đã được log để xử lý tay nếu cần.
    return res.status(200).json({ success: false, message: 'Đã ghi log lỗi nội bộ' });
  }
};
