const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createCouponSchema,
  updateCouponSchema,
} = require('../validations/coupon.validation');

// All coupon routes are protected for Admin only
router.use(verifyToken, verifyAdmin);

router
  .route('/')
  .get(couponController.getAll)
  .post(validate(createCouponSchema), couponController.createOne);

router
  .route('/:id')
  .get(couponController.getOne)
  .patch(validate(updateCouponSchema), couponController.updateOne)
  .delete(couponController.deleteOne);

module.exports = router;
