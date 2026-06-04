const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const purchaseController = require('../controllers/purchase.controller');
const {
  verifyToken,
  optionalAuth,
  verifyInstructorOrAdmin,
  verifyAdmin,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createCourseSchema,
  updateCourseSchema,
} = require('../validations/course.validation');

// GET    /api/courses  — Optional auth: kết quả lọc theo subscription của user
// POST   /api/courses  — Admin only
router
  .route('/')
  
  .get(optionalAuth, courseController.getAll)
  
  .post(
    verifyToken,
    verifyAdmin,
    validate(createCourseSchema),
    courseController.createOne,
  );

// GET    /api/courses/:id  — Optional auth: kiểm tra quyền theo subscription
// PATCH  /api/courses/:id  — Admin only: update
// DELETE /api/courses/:id  — Admin only
router
  .route('/:id')
  
  .get(optionalAuth, courseController.getOne)
  
  .patch(
    verifyToken,
    verifyAdmin,
    validate(updateCourseSchema),
    courseController.updateOne,
  )
  
  .delete(verifyToken, verifyAdmin, courseController.deleteOne);

// POST   /api/courses/:id/purchase - Lên đơn thanh toán mua lẻ khóa học
router.post('/:id/purchase', verifyToken, purchaseController.requestCoursePayment);

module.exports = router;
