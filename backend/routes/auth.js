const express = require('express');
const router  = express.Router();
const { 
  login, 
  googleLogin, 
  refresh, 
  logout, 
  getMe, 
  changePassword,
  setupTotp,
  verifyTotpSetup,
  verifyTotpLogin,
  disableTotp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login',        login);
router.post('/google-login', googleLogin);
router.post('/refresh',      refresh);
router.post('/logout',       protect, logout);
router.get('/me',            protect, getMe);
router.put('/change-password', protect, changePassword);

// TOTP Routes
router.post('/totp/setup', protect, setupTotp);
router.post('/totp/verify-setup', protect, verifyTotpSetup);
router.post('/totp/verify-login', verifyTotpLogin);
router.delete('/totp/disable', protect, disableTotp);

module.exports = router;
