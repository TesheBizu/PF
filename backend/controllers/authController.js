const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helpers
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

// Short-lived token used between password verification and TOTP verification
const generateTempToken = (id) =>
  jwt.sign({ id, purpose: 'totp' }, process.env.JWT_SECRET, { expiresIn: '3m' });

const buildUserResponse = (user, accessToken, refreshToken) => ({
  success: true,
  accessToken,
  refreshToken,
  user: { id: user._id, name: user.name, email: user.email, role: user.role, totpEnabled: user.totpEnabled },
});

// @desc    Login admin (email + password)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password +totpSecret');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // If 2FA is enabled, return a temp token instead of full session
    if (user.totpEnabled) {
      const tempToken = generateTempToken(user._id);
      return res.status(200).json({ success: true, requiresTOTP: true, tempToken });
    }

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(buildUserResponse(user, accessToken, refreshToken));
  } catch (error) { next(error); }
};

// @desc    Google Sign-In for admin
// @route   POST /api/auth/google-login
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ success: false, message: 'Google credential required' });

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Only the admin email may log in via Google
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the portfolio admin can sign in.',
      });
    }

    // Find or create the admin user (no password needed for OAuth users)
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || 'Admin',
        email,
        password: Math.random().toString(36) + Date.now().toString(36), // random, unusable
        role: 'admin',
        avatar: picture,
      });
    }

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(buildUserResponse(user, accessToken, refreshToken));
  } catch (error) {
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ success: false, message: 'Google token expired or invalid' });
    }
    next(error);
  }
};

// @desc    Verify TOTP code during login (exchange tempToken for real tokens)
// @route   POST /api/auth/totp/verify-login
const verifyTotpLogin = async (req, res, next) => {
  try {
    const { tempToken, totpCode } = req.body;
    if (!tempToken || !totpCode)
      return res.status(400).json({ success: false, message: 'Temp token and TOTP code are required' });

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Temp token expired or invalid. Please log in again.' });
    }

    if (decoded.purpose !== 'totp')
      return res.status(401).json({ success: false, message: 'Invalid token purpose' });

    const user = await User.findById(decoded.id).select('+totpSecret');
    if (!user || !user.totpEnabled || !user.totpSecret)
      return res.status(400).json({ success: false, message: '2FA is not enabled on this account' });

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1, // allow 30s clock drift
    });

    if (!verified)
      return res.status(401).json({ success: false, message: 'Invalid authenticator code. Please try again.' });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(buildUserResponse(user, accessToken, refreshToken));
  } catch (error) { next(error); }
};

// @desc    Generate TOTP secret + QR code for setup
// @route   POST /api/auth/totp/setup
const setupTotp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate a new secret every time setup is requested
    const secret = speakeasy.generateSecret({
      name: `Portfolio Admin (${user.email})`,
      length: 32,
    });

    // Temporarily store the unverified secret
    await User.findByIdAndUpdate(user._id, { totpSecret: secret.base32 });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      qrCodeUrl,
      manualKey: secret.base32, // fallback for manual entry
    });
  } catch (error) { next(error); }
};

// @desc    Verify the setup code and activate 2FA
// @route   POST /api/auth/totp/verify-setup
const verifyTotpSetup = async (req, res, next) => {
  try {
    const { totpCode } = req.body;
    if (!totpCode)
      return res.status(400).json({ success: false, message: 'TOTP code is required' });

    const user = await User.findById(req.user._id).select('+totpSecret');
    if (!user || !user.totpSecret)
      return res.status(400).json({ success: false, message: 'No pending 2FA setup found. Start setup first.' });

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ success: false, message: 'Invalid code. Make sure you scanned the QR code correctly.' });

    user.totpEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: '2FA has been enabled successfully!' });
  } catch (error) { next(error); }
};

// @desc    Disable 2FA
// @route   DELETE /api/auth/totp/disable
const disableTotp = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: 'Password is required to disable 2FA' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    user.totpEnabled = false;
    user.totpSecret  = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: '2FA has been disabled.' });
  } catch (error) { next(error); }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken     = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) { next(error); }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) { user.refreshToken = undefined; await user.save({ validateBeforeSave: false }); }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

// @desc    Get current admin
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Change admin password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, googleLogin, refresh, logout, getMe, changePassword, setupTotp, verifyTotpSetup, verifyTotpLogin, disableTotp };
