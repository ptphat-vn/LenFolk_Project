const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment and checkout via ZaloPay
 */

/**
 * @swagger
 * /payments/zalopay/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a ZaloPay order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               item:
 *                 type: array
 *                 items:
 *                   type: object
 *               description:
 *                 type: string
 *                 example: Thanh toan don hang
 *               redirecturl:
 *                 type: string
 *                 example: yourapp://payment-result
 *                 description: (Dành cho Mobile App) Deep link để ZaloPay quay trở lại app sau khi thanh toán.
 *     responses:
 *       200:
 *         description: Order created
 *       500:
 *         description: Server error
 */
router.post('/zalopay/create-order', verifyToken, paymentController.createOrder);

/**
 * @swagger
 * /payments/zalopay/callback:
 *   post:
 *     tags: [Payments]
 *     summary: ZaloPay webhook callback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *               mac:
 *                 type: string
 *     responses:
 *       200:
 *         description: Callback processed
 */
router.post('/zalopay/callback', paymentController.callback);

/**
 * @swagger
 * /payments/zalopay/check-status:
 *   post:
 *     tags: [Payments]
 *     summary: Check ZaloPay order status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               app_trans_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status returned
 */
router.post('/zalopay/check-status', verifyToken, paymentController.checkOrderStatus);

module.exports = router;
