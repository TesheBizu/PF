const express = require('express');
const router = express.Router();
const {
  getOverview,
  getRealtime,
  getTraffic,
  getPages,
  getDevices,
  getCountries,
  getEvents,
  getTrend,
} = require('../controllers/adminAnalyticsController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, getOverview);
router.get('/realtime', protect, getRealtime);
router.get('/traffic', protect, getTraffic);
router.get('/pages', protect, getPages);
router.get('/devices', protect, getDevices);
router.get('/countries', protect, getCountries);
router.get('/events', protect, getEvents);
router.get('/trend', protect, getTrend);

module.exports = router;
