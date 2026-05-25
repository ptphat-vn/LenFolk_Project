const express = require('express');
const router = express.Router();

const instructorProfileController = require('../controllers/instructor-profile.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createInstructorProfileSchema, updateInstructorProfileSchema } = require('../validations/instructor-profile.validation');

router.use(verifyToken);

router
  .route('/')
  .get(instructorProfileController.getAll)
  .post(validate(createInstructorProfileSchema), instructorProfileController.createOne);

router
  .route('/:id')
  .get(instructorProfileController.getOne)
  .patch(validate(updateInstructorProfileSchema), instructorProfileController.updateOne)
  .delete(verifyAdmin, instructorProfileController.deleteOne);

module.exports = router;
