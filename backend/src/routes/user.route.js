const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');

// All user routes require authentication
router.use(verifyToken);

// GET  /api/users        - Admin only: get all users
// POST /api/users        - Admin only: create a user
router
  .route('/')
  .get(verifyAdmin, userController.getAll)
  .post(verifyAdmin, validate(createUserSchema), userController.createOne);

// GET    /api/users/:id  - Admin only: get user by ID
// PATCH  /api/users/:id  - Admin only: update user
// DELETE /api/users/:id  - Admin only: delete user
router
  .route('/:id')
  .get(verifyAdmin, userController.getOne)
  .patch(verifyAdmin, validate(updateUserSchema), userController.updateOne)
  .delete(verifyAdmin, userController.deleteOne);

module.exports = router;
