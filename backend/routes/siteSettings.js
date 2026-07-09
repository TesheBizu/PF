const express = require('express');
const router = express.Router();
const { getProfileImage, updateProfileImage, deleteProfileImage } = require('../controllers/siteSettingController');
const { protect } = require('../middleware/auth');

router.get('/profile-image', getProfileImage);
router.put('/profile-image', protect, updateProfileImage);
router.delete('/profile-image', protect, deleteProfileImage);

module.exports = router;
