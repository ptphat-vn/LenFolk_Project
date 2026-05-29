const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/permission.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createPermissionSchema, updatePermissionSchema } = require('../validations/permission.validation');

router.use(verifyToken, verifyAdmin);

router
  .route('/')

.get(permissionController.getAll)

.post(validate(createPermissionSchema), permissionController.createOne);

router
  .route('/:id')

.get(permissionController.getOne)

.patch(validate(updatePermissionSchema), permissionController.updateOne)

.delete(permissionController.deleteOne);

module.exports = router;
