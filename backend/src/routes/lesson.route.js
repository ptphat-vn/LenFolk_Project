const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lesson.controller');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createLessonSchema,
  updateLessonSchema,
} = require('../validations/lesson.validation');

// GET    /api/lessons      - Auth optional (filtered based on role)
// POST   /api/lessons      - Admin only (per business requirement)
router
  .route('/')
  
  .get(optionalAuth, lessonController.getAll)
  
  .post(
    verifyToken,
    verifyAdmin,
    upload.lessonMaterial.fields([
      { name: 'video', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'pdf', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    validate(createLessonSchema),
    lessonController.createOne,
  );

// GET    /api/lessons/:id  - Auth optional; public can view free published lessons
// PATCH  /api/lessons/:id  - Admin only
// DELETE /api/lessons/:id  - Admin only
router
  .route('/:id')
  
  .get(optionalAuth, lessonController.getOne)
  
  .patch(
    verifyToken,
    verifyAdmin,
    upload.lessonMaterial.fields([
      { name: 'video', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'pdf', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    validate(updateLessonSchema),
    lessonController.updateOne,
  )
  
  .delete(verifyToken, verifyAdmin, lessonController.deleteOne);

module.exports = router;
