/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscriptions management
 */

const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscription.controller');
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createSubscriptionSchema, updateSubscriptionSchema } = require('../validations/subscription.validation');

// GET  /api/subscriptions  - Public: view subscription plans
// POST /api/subscriptions  - Admin only: create plan
router
  .route('/')
/**
 * @swagger
 * /subscriptions:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(subscriptionController.getAll)
/**
 * @swagger
 * /subscriptions:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Post subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.post(verifyToken, verifyAdmin, validate(createSubscriptionSchema), subscriptionController.createOne);

// GET    /api/subscriptions/:id  - Public
// PATCH  /api/subscriptions/:id  - Admin only
// DELETE /api/subscriptions/:id  - Admin only
router
  .route('/:id')
/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.get(subscriptionController.getOne)
/**
 * @swagger
 * /subscriptions/{id}:
 *   patch:
 *     tags: [Subscriptions]
 *     summary: Patch subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.patch(verifyToken, verifyAdmin, validate(updateSubscriptionSchema), subscriptionController.updateOne)
/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     tags: [Subscriptions]
 *     summary: Delete subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.delete(verifyToken, verifyAdmin, subscriptionController.deleteOne);

// POST /api/subscriptions/:id/purchase - Authenticated user: buy a subscription plan
router.post('/:id/purchase', verifyToken, purchaseController.purchase);

module.exports = router;
