/**
 * @swagger
 * tags:
 *   name: InstructorProfiles
 *   description: InstructorProfiles management
 */

const express = require('express');
const router = express.Router();

const instructorProfileController = require('../controllers/instructor-profile.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createInstructorProfileSchema, updateInstructorProfileSchema } = require('../validations/instructor-profile.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /instructor-profiles:
 *   get:
 *     tags: [InstructorProfiles]
 *     summary: Get instructor-profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(instructorProfileController.getAll)
/**
 * @swagger
 * /instructor-profiles:
 *   post:
 *     tags: [InstructorProfiles]
 *     summary: Post instructor-profile
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
.post(validate(createInstructorProfileSchema), instructorProfileController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /instructor-profiles/{id}:
 *   get:
 *     tags: [InstructorProfiles]
 *     summary: Get instructor-profile
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
.get(instructorProfileController.getOne)
/**
 * @swagger
 * /instructor-profiles/{id}:
 *   patch:
 *     tags: [InstructorProfiles]
 *     summary: Patch instructor-profile
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
.patch(validate(updateInstructorProfileSchema), instructorProfileController.updateOne)
/**
 * @swagger
 * /instructor-profiles/{id}:
 *   delete:
 *     tags: [InstructorProfiles]
 *     summary: Delete instructor-profile
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
.delete(verifyAdmin, instructorProfileController.deleteOne);

module.exports = router;
