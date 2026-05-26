/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: AuditLogs management
 */

const express = require('express');
const router = express.Router();

const auditLogController = require('../controllers/audit-log.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createAuditLogSchema } = require('../validations/audit-log.validation');

router.use(verifyToken, verifyAdmin);

router
  .route('/')
/**
 * @swagger
 * /audit-logs:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit-log
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(auditLogController.getAll)
/**
 * @swagger
 * /audit-logs:
 *   post:
 *     tags: [AuditLogs]
 *     summary: Post audit-log
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
.post(validate(createAuditLogSchema), auditLogController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /audit-logs/{id}:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Get audit-log
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
.get(auditLogController.getOne)
/**
 * @swagger
 * /audit-logs/{id}:
 *   delete:
 *     tags: [AuditLogs]
 *     summary: Delete audit-log
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
.delete(auditLogController.deleteOne);

module.exports = router;
