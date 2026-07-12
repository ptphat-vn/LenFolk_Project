const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const controller = require('../controllers/push-token.controller');
const router = express.Router();

router.use(verifyToken);
router.post('/', controller.register);
router.delete('/', controller.unregister);

module.exports = router;
