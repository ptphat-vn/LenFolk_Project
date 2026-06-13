const express = require('express');
const router = express.Router();

const sepayController = require('../controllers/sepay.controller');

// PUBLIC — SePay gọi server-to-server, KHÔNG qua verifyToken.
// Bảo mật bằng Api Key trong header Authorization (xem sepay.controller).
router.post('/sepay/webhook', sepayController.webhook);

module.exports = router;
