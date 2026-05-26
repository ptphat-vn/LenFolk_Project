const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');
const { verifyToken, verifyInstructor, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCourseSchema, updateCourseSchema } = require('../validations/course.validation');

// GET    /api/courses      - Public: list all published courses
// POST   /api/courses      - Instructor/Admin: create course
router
  .route('/')
  .get(courseController.getAll)
  .post(verifyToken, validate(createCourseSchema), courseController.createOne);

// GET    /api/courses/:id  - Public: get one course
// PATCH  /api/courses/:id  - Instructor/Admin: update course
// DELETE /api/courses/:id  - Admin: delete course
router
  .route('/:id')
  .get(courseController.getOne)
  .patch(verifyToken, validate(updateCourseSchema), courseController.updateOne)
  .delete(verifyToken, verifyAdmin, courseController.deleteOne);

module.exports = router;
