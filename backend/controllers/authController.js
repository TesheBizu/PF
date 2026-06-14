const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helpers
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

const buildUserResponse = (user, accessToken, refreshToken) => ({
  success: true,
  accessToken,
  refreshToken,
  user: { id: user._id, name: user.name, email: user.email, role: user.role },
});

// @desc    Login admin (email + password)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

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

module.exports = { login, googleLogin, refresh, logout, getMe };
