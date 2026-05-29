const express = require('express');
const router = express.Router();

const badgeController = require('../controllers/badge.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBadgeSchema, updateBadgeSchema } = require('../validations/badge.validation');

// GET  /api/badges  - Public
// POST /api/badges  - Admin only
router
  .route('/')

.get(badgeController.getAll)

.post(verifyToken, verifyAdmin, validate(createBadgeSchema), badgeController.createOne);

// GET    /api/badges/:id  - Public
// PATCH  /api/badges/:id  - Admin only
// DELETE /api/badges/:id  - Admin only
router
  .route('/:id')

.get(badgeController.getOne)

.patch(verifyToken, verifyAdmin, validate(updateBadgeSchema), badgeController.updateOne)

.delete(verifyToken, verifyAdmin, badgeController.deleteOne);

module.exports = router;
