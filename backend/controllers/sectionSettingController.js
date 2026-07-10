const SectionSetting = require('../models/SectionSetting');
const { getIO } = require('../socket');

const getAllSettings = async (req, res, next) => {
  try {
    const settings = await SectionSetting.find();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    res.status(200).json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
};

const getSetting = async (req, res, next) => {
  try {
    const setting = await SectionSetting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.status(200).json({ success: true, data: { key: setting.key, value: setting.value } });
  } catch (error) {
    next(error);
  }
};

const upsertSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key is required' });
    if (value === undefined || value === null) return res.status(400).json({ success: false, message: 'Value is required' });
    const setting = await SectionSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true, runValidators: true }
    );
    getIO().emit('sectionSetting:updated', { key, value: setting.value });
    res.status(200).json({ success: true, data: { key: setting.key, value: setting.value } });
  } catch (error) {
    next(error);
  }
};

const deleteSetting = async (req, res, next) => {
  try {
    const setting = await SectionSetting.findOneAndDelete({ key: req.params.key });
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
    getIO().emit('sectionSetting:deleted', req.params.key);
    res.status(200).json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSettings, getSetting, upsertSetting, deleteSetting };
