const SocialLink = require('../models/SocialLink');
const { getIO } = require('../socket');

const getSocialLinks = async (req, res, next) => {
  try {
    const links = await SocialLink.find().sort({ order: 1 });
    res.status(200).json({ success: true, count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

const getActiveSocialLinks = async (req, res, next) => {
  try {
    const links = await SocialLink.find({ active: true }).sort({ order: 1 });
    res.status(200).json({ success: true, count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

const createSocialLink = async (req, res, next) => {
  try {
    const link = await SocialLink.create(req.body);
    getIO().emit('socialLink:created', link.toObject());
    res.status(201).json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

const updateSocialLink = async (req, res, next) => {
  try {
    const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!link) return res.status(404).json({ success: false, message: 'Social link not found' });
    getIO().emit('socialLink:updated', link.toObject());
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

const updateSocialLinksOrder = async (req, res, next) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links)) return res.status(400).json({ success: false, message: 'links must be an array' });
    for (const item of links) {
      await SocialLink.findByIdAndUpdate(item.id, { order: item.order });
    }
    const updated = await SocialLink.find().sort({ order: 1 });
    getIO().emit('socialLinks:reordered', updated.map((l) => l.toObject()));
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteSocialLink = async (req, res, next) => {
  try {
    const link = await SocialLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Social link not found' });
    getIO().emit('socialLink:deleted', link._id.toString());
    res.status(200).json({ success: true, message: 'Social link deleted' });
  } catch (error) {
    next(error);
  }
};

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'Email', url: 'mailto:teshelin7@gmail.com', icon: 'mail', label: 'Email', order: 0, active: true },
  { platform: 'Phone', url: 'tel:+251988044439', icon: 'phone', label: 'Phone', order: 1, active: true },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/teshome-bizuayehu', icon: 'linkedin', label: 'LinkedIn', order: 2, active: true },
  { platform: 'GitHub', url: 'https://github.com/TesheBizu', icon: 'github', label: 'GitHub', order: 3, active: true },
  { platform: 'Telegram', url: '', icon: 'telegram', label: 'Telegram', order: 4, active: false },
  { platform: 'Facebook', url: '', icon: 'facebook', label: 'Facebook', order: 5, active: false },
  { platform: 'Instagram', url: '', icon: 'instagram', label: 'Instagram', order: 6, active: false },
  { platform: 'X (Twitter)', url: '', icon: 'x', label: 'X (Twitter)', order: 7, active: false },
  { platform: 'Discord', url: '', icon: 'discord', label: 'Discord', order: 8, active: false },
  { platform: 'WhatsApp', url: '', icon: 'whatsapp', label: 'WhatsApp', order: 9, active: false },
];

const seedSocialLinks = async (req, res, next) => {
  try {
    const existing = await SocialLink.countDocuments();
    if (existing > 0) {
      return res.status(200).json({ success: true, message: 'Social links already seeded', count: existing });
    }
    const links = await SocialLink.insertMany(DEFAULT_SOCIAL_LINKS);
    getIO().emit('socialLinks:reordered', links.map((l) => l.toObject()));
    res.status(201).json({ success: true, message: 'Social links seeded', count: links.length, data: links });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSocialLinks, getActiveSocialLinks, createSocialLink, updateSocialLink, updateSocialLinksOrder, deleteSocialLink, seedSocialLinks };
