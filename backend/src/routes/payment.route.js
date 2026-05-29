const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');




router.post('/zalopay/create-order', verifyToken, paymentController.createOrder);


router.post('/zalopay/callback', paymentController.callback);


router.post('/zalopay/check-status', verifyToken, paymentController.checkOrderStatus);

module.exports = router;
