/**
 * @swagger
 * tags:
 *   name: Streaks
 *   description: Streaks management
 */

const express = require('express');
const router = express.Router();

const streakController = require('../controllers/streak.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStreakSchema, updateStreakSchema } = require('../validations/streak.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /streaks:
 *   get:
 *     tags: [Streaks]
 *     summary: Get streak
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(streakController.getAll)
/**
 * @swagger
 * /streaks:
 *   post:
 *     tags: [Streaks]
 *     summary: Post streak
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
.post(validate(createStreakSchema), streakController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /streaks/{id}:
 *   get:
 *     tags: [Streaks]
 *     summary: Get streak
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
.get(streakController.getOne)
/**
 * @swagger
 * /streaks/{id}:
 *   patch:
 *     tags: [Streaks]
 *     summary: Patch streak
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
.patch(validate(updateStreakSchema), streakController.updateOne)
/**
 * @swagger
 * /streaks/{id}:
 *   delete:
 *     tags: [Streaks]
 *     summary: Delete streak
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
.delete(streakController.deleteOne);

module.exports = router;
