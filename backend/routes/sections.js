const express = require('express');
const router = express.Router();
const {
  getAllSettings,
  getSetting,
  upsertSetting,
  deleteSetting,
} = require('../controllers/sectionSettingController');
const { protect } = require('../middleware/auth');

router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.put('/:key', protect, upsertSetting);
router.delete('/:key', protect, deleteSetting);

module.exports = router;
