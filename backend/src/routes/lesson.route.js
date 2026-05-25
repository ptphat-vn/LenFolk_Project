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
  .get(verifyToken, lessonController.getAll)
  .post(verifyToken, validate(createLessonSchema), lessonController.createOne);

// GET    /api/lessons/:id  - Auth required
// PATCH  /api/lessons/:id  - Auth required
// DELETE /api/lessons/:id  - Admin only
router
  .route('/:id')
  .get(verifyToken, lessonController.getOne)
  .patch(verifyToken, validate(updateLessonSchema), lessonController.updateOne)
  .delete(verifyToken, verifyAdmin, lessonController.deleteOne);

module.exports = router;
