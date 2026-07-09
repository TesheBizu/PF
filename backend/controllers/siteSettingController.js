const SiteSetting = require('../models/SiteSetting');
const { getIO } = require('../socket');

const PROFILE_KEY = 'profileImage';

const getProfileImage = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: PROFILE_KEY });
    res.json({ success: true, url: setting?.value || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    const setting = await SiteSetting.findOneAndUpdate(
      { key: PROFILE_KEY },
      { value: url },
      { upsert: true, new: true }
    );
    getIO().emit('profileImage:updated', setting.value);
    res.json({ success: true, url: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    await SiteSetting.findOneAndDelete({ key: PROFILE_KEY });
    getIO().emit('profileImage:deleted');
    res.json({ success: true, url: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfileImage, updateProfileImage, deleteProfileImage };
