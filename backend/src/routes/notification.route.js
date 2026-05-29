const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createNotificationSchema, updateNotificationSchema } = require('../validations/notification.validation');

router.use(verifyToken);

router
  .route('/')

.get(notificationController.getAll)

.post(verifyAdmin, validate(createNotificationSchema), notificationController.createOne);

router
  .route('/:id')

.get(notificationController.getOne)

.patch(validate(updateNotificationSchema), notificationController.updateOne)

.delete(verifyAdmin, notificationController.deleteOne);

module.exports = router;
