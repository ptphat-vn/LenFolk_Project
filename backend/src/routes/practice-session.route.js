/**
 * @swagger
 * tags:
 *   name: PracticeSessions
 *   description: PracticeSessions management
 */

const express = require('express');
const router = express.Router();

const practiceSessionController = require('../controllers/practice-session.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createPracticeSessionSchema, updatePracticeSessionSchema } = require('../validations/practice-session.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /practice-sessions:
 *   get:
 *     tags: [PracticeSessions]
 *     summary: Get practice-session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(practiceSessionController.getAll)
/**
 * @swagger
 * /practice-sessions:
 *   post:
 *     tags: [PracticeSessions]
 *     summary: Post practice-session
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
.post(validate(createPracticeSessionSchema), practiceSessionController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /practice-sessions/{id}:
 *   get:
 *     tags: [PracticeSessions]
 *     summary: Get practice-session
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
.get(practiceSessionController.getOne)
/**
 * @swagger
 * /practice-sessions/{id}:
 *   patch:
 *     tags: [PracticeSessions]
 *     summary: Patch practice-session
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
.patch(validate(updatePracticeSessionSchema), practiceSessionController.updateOne)
/**
 * @swagger
 * /practice-sessions/{id}:
 *   delete:
 *     tags: [PracticeSessions]
 *     summary: Delete practice-session
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
.delete(practiceSessionController.deleteOne);

module.exports = router;
