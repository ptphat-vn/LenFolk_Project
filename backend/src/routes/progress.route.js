const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progress.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProgressSchema, updateProgressSchema } = require('../validations/progress.validation');

router.use(verifyToken);

router
  .route('/')
  .get(progressController.getAll)
  .post(validate(createProgressSchema), progressController.createOne);

router
  .route('/:id')
  .get(progressController.getOne)
  .patch(validate(updateProgressSchema), progressController.updateOne)
  .delete(progressController.deleteOne);

module.exports = router;
