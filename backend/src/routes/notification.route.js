/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notifications management
 */

const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createNotificationSchema, updateNotificationSchema } = require('../validations/notification.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(notificationController.getAll)
/**
 * @swagger
 * /notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Post notification
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
.post(verifyAdmin, validate(createNotificationSchema), notificationController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification
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
.get(notificationController.getOne)
/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     tags: [Notifications]
 *     summary: Patch notification
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
.patch(validate(updateNotificationSchema), notificationController.updateOne)
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
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
.delete(verifyAdmin, notificationController.deleteOne);

module.exports = router;
