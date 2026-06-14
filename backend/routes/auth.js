const express = require('express');
const router  = express.Router();
const { login, googleLogin, refresh, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login',        login);
router.post('/google-login', googleLogin);
router.post('/refresh',      refresh);
router.post('/logout',       protect, logout);
router.get('/me',            protect, getMe);

module.exports = router;
