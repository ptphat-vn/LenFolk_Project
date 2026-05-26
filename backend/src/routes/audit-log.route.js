const express = require('express');
const router = express.Router();

const auditLogController = require('../controllers/audit-log.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createAuditLogSchema } = require('../validations/audit-log.validation');

router.use(verifyToken, verifyAdmin);

router
  .route('/')
  .get(auditLogController.getAll)
  .post(validate(createAuditLogSchema), auditLogController.createOne);

router
  .route('/:id')
  .get(auditLogController.getOne)
  .delete(auditLogController.deleteOne);

module.exports = router;
