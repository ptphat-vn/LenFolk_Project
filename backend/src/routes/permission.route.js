/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permissions management
 */

const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/permission.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createPermissionSchema, updatePermissionSchema } = require('../validations/permission.validation');

router.use(verifyToken, verifyAdmin);

router
  .route('/')
/**
 * @swagger
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Get permission
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(permissionController.getAll)
/**
 * @swagger
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Post permission
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.post(validate(createPermissionSchema), permissionController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Get permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.get(permissionController.getOne)
/**
 * @swagger
 * /permissions/{id}:
 *   patch:
 *     tags: [Permissions]
 *     summary: Patch permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.patch(validate(updatePermissionSchema), permissionController.updateOne)
/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Delete permission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.delete(permissionController.deleteOne);

module.exports = router;
