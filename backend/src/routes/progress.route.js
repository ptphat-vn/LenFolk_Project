/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Progress management
 */

const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progress.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProgressSchema, updateProgressSchema } = require('../validations/progress.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /progresss:
 *   get:
 *     tags: [Progress]
 *     summary: Get progress
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(progressController.getAll)
/**
 * @swagger
 * /progresss:
 *   post:
 *     tags: [Progress]
 *     summary: Post progress
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
.post(validate(createProgressSchema), progressController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /progresss/{id}:
 *   get:
 *     tags: [Progress]
 *     summary: Get progress
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
.get(progressController.getOne)
/**
 * @swagger
 * /progresss/{id}:
 *   patch:
 *     tags: [Progress]
 *     summary: Patch progress
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
.patch(validate(updateProgressSchema), progressController.updateOne)
/**
 * @swagger
 * /progresss/{id}:
 *   delete:
 *     tags: [Progress]
 *     summary: Delete progress
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
.delete(progressController.deleteOne);

module.exports = router;
