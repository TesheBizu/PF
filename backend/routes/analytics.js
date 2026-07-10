const express = require('express');
const router = express.Router();
const { getAnalytics, getAnalyticsDetail, exportAnalytics, recordEvent, seedAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAnalytics);
router.get('/detail', protect, getAnalyticsDetail);
router.get('/export', protect, exportAnalytics);
router.post('/record', recordEvent);
router.post('/seed', protect, seedAnalytics);

module.exports = router;
