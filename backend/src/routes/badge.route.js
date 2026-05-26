/**
 * @swagger
 * tags:
 *   name: Badges
 *   description: Badges management
 */

const express = require('express');
const router = express.Router();

const badgeController = require('../controllers/badge.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBadgeSchema, updateBadgeSchema } = require('../validations/badge.validation');

// GET  /api/badges  - Public
// POST /api/badges  - Admin only
router
  .route('/')
/**
 * @swagger
 * /badges:
 *   get:
 *     tags: [Badges]
 *     summary: Get badge
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(badgeController.getAll)
/**
 * @swagger
 * /badges:
 *   post:
 *     tags: [Badges]
 *     summary: Post badge
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
.post(verifyToken, verifyAdmin, validate(createBadgeSchema), badgeController.createOne);

// GET    /api/badges/:id  - Public
// PATCH  /api/badges/:id  - Admin only
// DELETE /api/badges/:id  - Admin only
router
  .route('/:id')
/**
 * @swagger
 * /badges/{id}:
 *   get:
 *     tags: [Badges]
 *     summary: Get badge
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
.get(badgeController.getOne)
/**
 * @swagger
 * /badges/{id}:
 *   patch:
 *     tags: [Badges]
 *     summary: Patch badge
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
.patch(verifyToken, verifyAdmin, validate(updateBadgeSchema), badgeController.updateOne)
/**
 * @swagger
 * /badges/{id}:
 *   delete:
 *     tags: [Badges]
 *     summary: Delete badge
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
.delete(verifyToken, verifyAdmin, badgeController.deleteOne);

module.exports = router;
