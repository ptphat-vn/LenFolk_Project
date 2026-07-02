const express = require('express');
const router = express.Router();

const performanceController = require('../controllers/performance.controller');
const purchaseController = require('../controllers/purchase.controller');
const upload = require('../middlewares/upload.middleware');
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
  approvePerformanceSchema,
  rejectPerformanceSchema,
} = require('../validations/performance.validation');

// GET  /api/performances  — Optional auth: kết quả lọc theo quyền truy cập
// POST /api/performances  — Admin/Instructor: tạo tiết mục mới (instructor luôn pending)
router
  .route('/')
  .get(optionalAuth, performanceController.getAll)
  .post(
    verifyToken,
    verifyInstructorOrAdmin,
    upload.performanceDocuments.fields([
      { name: 'documents', maxCount: 10 },
      { name: 'images', maxCount: 10 },
    ]),
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
    upload.performanceDocuments.fields([
      { name: 'documents', maxCount: 10 },
      { name: 'images', maxCount: 10 },
    ]),
    validate(updatePerformanceSchema),
    performanceController.updateOne,
  )
  .delete(verifyToken, verifyAdmin, performanceController.deleteOne);

// PATCH /api/performances/:id/approve — Admin duyệt tiết mục (pending → published)
router.patch(
  '/:id/approve',
  verifyToken,
  verifyAdmin,
  validate(approvePerformanceSchema),
  performanceController.approveOne,
);

// PATCH /api/performances/:id/reject — Admin từ chối tiết mục (pending → archived)
router.patch(
  '/:id/reject',
  verifyToken,
  verifyAdmin,
  validate(rejectPerformanceSchema),
  performanceController.rejectOne,
);

// POST /api/performances/:id/purchase — Lên đơn thanh toán mua tiết mục
router.post(
  '/:id/purchase',
  verifyToken,
  purchaseController.requestPerformancePayment,
);

module.exports = router;
