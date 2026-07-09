const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getPublishedTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');

router.get('/published', getPublishedTestimonials);
router.get('/', protect, getTestimonials);
router.get('/:id', getTestimonial);

router.post('/', protect, createTestimonial);
router.put('/:id', protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
