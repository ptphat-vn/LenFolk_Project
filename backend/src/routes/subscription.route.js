const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscription.controller');
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} = require('../validations/subscription.validation');

// GET  /api/subscriptions  - Public: view subscription plans
// POST /api/subscriptions  - Admin only: create plan
router
  .route('/')
  
  .get(subscriptionController.getAll)
  
  .post(
    verifyToken,
    verifyAdmin,
    validate(createSubscriptionSchema),
    subscriptionController.createOne,
  );

// GET    /api/subscriptions/:id  - Public
// PATCH  /api/subscriptions/:id  - Admin only
// DELETE /api/subscriptions/:id  - Admin only
router
  .route('/:id')
  
  .get(subscriptionController.getOne)
  
  .patch(
    verifyToken,
    verifyAdmin,
    validate(updateSubscriptionSchema),
    subscriptionController.updateOne,
  )
  
  .delete(verifyToken, verifyAdmin, subscriptionController.deleteOne);


router.post('/:id/request', verifyToken, purchaseController.requestPayment);

module.exports = router;
