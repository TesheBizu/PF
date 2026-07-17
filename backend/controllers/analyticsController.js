const Analytics = require('../models/Analytics');

const LOG_PREFIX = '[Analytics]';

const getAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));
    const sinceStr = since.toISOString().slice(0, 10);
    const entries = await Analytics.find({ date: { $gte: sinceStr } }).sort({ date: 1 });
    const totals = entries.reduce(
      (acc, cur) => {
        acc.visitors += cur.visitors;
        acc.uniqueUsers += cur.uniqueUsers || 0;
        acc.pageViews += cur.pageViews;
        acc.interactions += cur.interactions;
        return acc;
      },
      { visitors: 0, uniqueUsers: 0, pageViews: 0, interactions: 0 }
    );
    res.status(200).json({
      success: true,
      summary: totals,
      entries,
      totalDays: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
