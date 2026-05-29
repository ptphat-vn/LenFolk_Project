const express = require('express');
const router = express.Router();

const transactionRecordController = require('../controllers/transaction-record.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createTransactionRecordSchema,
  updateTransactionRecordSchema,
} = require('../validations/transaction-record.validation');

router.use(verifyToken);

router
  .route('/')
  
  .get(transactionRecordController.getAll)
  
  .post(
    validate(createTransactionRecordSchema),
    transactionRecordController.createOne,
  );

router
  .route('/:id')
  
  .get(transactionRecordController.getOne)
  
  .patch(
    verifyAdmin,
    validate(updateTransactionRecordSchema),
    transactionRecordController.updateOne,
  )
  
  .delete(verifyAdmin, transactionRecordController.deleteOne);

// ── Payment proof & admin review actions ─────────────────────────────────────
const purchaseController = require('../controllers/purchase.controller');
const upload = require('../middlewares/upload.middleware');


router.patch(
  '/:id/upload-proof',
  upload.paymentProof.single('proof'),
  purchaseController.uploadProof,
);


router.patch('/:id/approve', verifyAdmin, purchaseController.approve);


router.patch('/:id/reject', verifyAdmin, purchaseController.reject);

module.exports = router;
