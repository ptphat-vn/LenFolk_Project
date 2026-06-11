const express = require('express');
const router = express.Router();

const systemSettingController = require('../controllers/system-setting.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateSystemSettingSchema } = require('../validations/system-setting.validation');

// GET /api/system-settings  — Public: QR + bank info dùng chung
router.get('/', systemSettingController.getSettings);

// PUT /api/system-settings  — Admin: cập nhật QR (field 'qrCode') + bank
router.put(
  '/',
  verifyToken,
  verifyAdmin,
  upload.qrCode.single('qrCode'),
  validate(updateSystemSettingSchema),
  systemSettingController.updateSettings,
);

module.exports = router;
