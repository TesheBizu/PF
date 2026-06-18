const express = require('express');
const router  = express.Router();
const { login, googleLogin, refresh, logout, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login',        login);
router.post('/google-login', googleLogin);
router.post('/refresh',      refresh);
router.post('/logout',       protect, logout);
router.get('/me',            protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
