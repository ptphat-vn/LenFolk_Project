const express = require('express');
const router = express.Router();

const streakController = require('../controllers/streak.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStreakSchema, updateStreakSchema } = require('../validations/streak.validation');

router.use(verifyToken);

router
  .route('/')

.get(streakController.getAll)

.post(validate(createStreakSchema), streakController.createOne);

router
  .route('/:id')

.get(streakController.getOne)

.patch(validate(updateStreakSchema), streakController.updateOne)

.delete(streakController.deleteOne);

module.exports = router;
