/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Lessons management
 */

const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lesson.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createLessonSchema, updateLessonSchema } = require('../validations/lesson.validation');

// GET    /api/lessons      - Auth required: list lessons (can filter by courseId)
// POST   /api/lessons      - Auth required: create lesson
router
  .route('/')
/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lesson
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(verifyToken, lessonController.getAll)
/**
 * @swagger
 * /lessons:
 *   post:
 *     tags: [Lessons]
 *     summary: Post lesson
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
.post(verifyToken, validate(createLessonSchema), lessonController.createOne);

// GET    /api/lessons/:id  - Auth required
// PATCH  /api/lessons/:id  - Auth required
// DELETE /api/lessons/:id  - Admin only
router
  .route('/:id')
/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get lesson
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
.get(verifyToken, lessonController.getOne)
/**
 * @swagger
 * /lessons/{id}:
 *   patch:
 *     tags: [Lessons]
 *     summary: Patch lesson
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
.patch(verifyToken, validate(updateLessonSchema), lessonController.updateOne)
/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     tags: [Lessons]
 *     summary: Delete lesson
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
.delete(verifyToken, verifyAdmin, lessonController.deleteOne);

module.exports = router;
