/**
 * @swagger
 * tags:
 *   name: ModeratorLogs
 *   description: ModeratorLogs management
 */

const express = require('express');
const router = express.Router();

const moderatorLogController = require('../controllers/moderator-log.controller');
const { verifyToken, verifyAdmin, verifyModerator } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createModeratorLogSchema } = require('../validations/moderator-log.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /moderator-logs:
 *   get:
 *     tags: [ModeratorLogs]
 *     summary: Get moderator-log
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(verifyAdmin, moderatorLogController.getAll)
/**
 * @swagger
 * /moderator-logs:
 *   post:
 *     tags: [ModeratorLogs]
 *     summary: Post moderator-log
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
.post(validate(createModeratorLogSchema), moderatorLogController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /moderator-logs/{id}:
 *   get:
 *     tags: [ModeratorLogs]
 *     summary: Get moderator-log
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
.get(moderatorLogController.getOne)
/**
 * @swagger
 * /moderator-logs/{id}:
 *   delete:
 *     tags: [ModeratorLogs]
 *     summary: Delete moderator-log
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
.delete(verifyAdmin, moderatorLogController.deleteOne);

module.exports = router;
