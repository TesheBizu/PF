const express = require('express');
const router = express.Router();
const { getAnalytics, recordEvent } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAnalytics);
router.post('/record', recordEvent);

module.exports = router;
