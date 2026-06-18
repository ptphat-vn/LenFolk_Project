const express = require('express');
const router = express.Router();

const siteStatController = require('../controllers/site-stat.controller');

// GET  /api/site-stats        - Lấy thống kê website (Public)
router.get('/', siteStatController.getStats);

// POST /api/site-stats/visit  - Ghi nhận 1 lượt truy cập (Public)
router.post('/visit', siteStatController.trackVisit);

module.exports = router;
