const express = require('express');

const aiAnalysisController = require('../controllers/ai-analysis.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(verifyToken);

router.post('/basic', upload.practiceMedia.single('file'), aiAnalysisController.basic);
router.post('/advanced', upload.practiceMedia.single('file'), aiAnalysisController.advanced);

module.exports = router;
