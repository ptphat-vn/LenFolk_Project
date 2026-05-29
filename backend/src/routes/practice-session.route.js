const express = require('express');
const router = express.Router();

const practiceSessionController = require('../controllers/practice-session.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createPracticeSessionSchema, updatePracticeSessionSchema } = require('../validations/practice-session.validation');

router.use(verifyToken);

router
  .route('/')

.get(practiceSessionController.getAll)

.post(validate(createPracticeSessionSchema), practiceSessionController.createOne);

router
  .route('/:id')

.get(practiceSessionController.getOne)

.patch(validate(updatePracticeSessionSchema), practiceSessionController.updateOne)

.delete(practiceSessionController.deleteOne);

module.exports = router;
