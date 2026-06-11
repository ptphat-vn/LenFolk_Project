const express = require('express');
const router = express.Router();

const enrollmentController = require('../controllers/enrollment.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// GET /api/enrollments/me  — user xem mình đã đăng ký course/tiết mục gì
router.get('/me', verifyToken, enrollmentController.getMine);

// GET /api/enrollments  — admin xem tất cả
router.get('/', verifyToken, verifyAdmin, enrollmentController.getAll);

module.exports = router;
