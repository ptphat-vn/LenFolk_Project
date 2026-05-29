const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { verifyToken, verifyAdmin, verifyInstructorOrAdmin } = require('../middlewares/auth.middleware');

// Instructor routes
router.use('/me', verifyToken, verifyInstructorOrAdmin);
router.get('/me', walletController.getMyWallet);

router.use('/bank-info', verifyToken, verifyInstructorOrAdmin);
router.put('/bank-info', walletController.updateBankInfo);

router.use('/payout', verifyToken, verifyInstructorOrAdmin);
router.post('/payout', walletController.requestPayout);

// Admin routes
router.use('/admin', verifyToken, verifyAdmin);
router.get('/admin/payouts', walletController.getAllPayouts);
router.patch('/admin/payouts/:id', walletController.processPayout);

module.exports = router;
