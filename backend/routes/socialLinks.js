const express = require('express');
const router = express.Router();
const {
  getSocialLinks,
  getActiveSocialLinks,
  createSocialLink,
  updateSocialLink,
  updateSocialLinksOrder,
  deleteSocialLink,
  seedSocialLinks,
} = require('../controllers/socialLinkController');
const { protect } = require('../middleware/auth');

router.get('/active', getActiveSocialLinks);
router.get('/', protect, getSocialLinks);
router.post('/seed', protect, seedSocialLinks);
router.post('/', protect, createSocialLink);
router.put('/reorder', protect, updateSocialLinksOrder);
router.put('/:id', protect, updateSocialLink);
router.delete('/:id', protect, deleteSocialLink);

module.exports = router;
