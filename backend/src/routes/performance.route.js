const express = require('express');
const router = express.Router();

const performanceController = require('../controllers/performance.controller');
const purchaseController = require('../controllers/purchase.controller');
const {
  verifyToken,
  optionalAuth,
  verifyInstructorOrAdmin,
  verifyAdmin,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createPerformanceSchema,
  updatePerformanceSchema,
} = require('../validations/performance.validation');

// GET  /api/performances  — Optional auth: kết quả lọc theo quyền truy cập
// POST /api/performances  — Admin/Instructor: tạo tiết mục mới
router
  .route('/')

  .get(optionalAuth, performanceController.getAll)

  .post(
    verifyToken,
    verifyInstructorOrAdmin,
    validate(createPerformanceSchema),
    performanceController.createOne,
  );

// GET    /api/performances/:id  — Optional auth: kiểm tra quyền theo subscription
// PATCH  /api/performances/:id  — Instructor (chỉ của mình) / Admin: update
// DELETE /api/performances/:id  — Admin only
router
  .route('/:id')

  .get(optionalAuth, performanceController.getOne)

  .patch(
    verifyToken,
    verifyInstructorOrAdmin,
    validate(updatePerformanceSchema),
    performanceController.updateOne,
  )

  .delete(verifyToken, verifyAdmin, performanceController.deleteOne);

// POST /api/performances/:id/purchase — Lên đơn thanh toán mua tiết mục
router.post(
  '/:id/purchase',
  verifyToken,
  purchaseController.requestPerformancePayment,
);

module.exports = router;
