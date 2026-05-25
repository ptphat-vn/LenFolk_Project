const express = require('express');
const router = express.Router();

const moderatorLogController = require('../controllers/moderator-log.controller');
const { verifyToken, verifyAdmin, verifyModerator } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createModeratorLogSchema } = require('../validations/moderator-log.validation');

router.use(verifyToken);

router
  .route('/')
  .get(verifyAdmin, moderatorLogController.getAll)
  .post(validate(createModeratorLogSchema), moderatorLogController.createOne);

router
  .route('/:id')
  .get(moderatorLogController.getOne)
  .delete(verifyAdmin, moderatorLogController.deleteOne);

module.exports = router;
