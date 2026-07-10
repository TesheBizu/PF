const Analytics = require('../models/Analytics');

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
        acc.pageViews += cur.pageViews;
        acc.interactions += cur.interactions;
        return acc;
      },
      { visitors: 0, pageViews: 0, interactions: 0 }
    );
    const pageViewsByPage = {};
    entries.forEach((entry) => {
      if (entry.pageViewDetails) {
        for (const [page, count] of Object.entries(entry.pageViewDetails.toObject())) {
          pageViewsByPage[page] = (pageViewsByPage[page] || 0) + count;
        }
      }
    });
    const avgVisitorsPerDay = entries.length ? Math.round(totals.visitors / entries.length) : 0;
    const avgPageViewsPerVisitor = totals.visitors ? (totals.pageViews / totals.visitors).toFixed(1) : '0.0';
    res.status(200).json({
      success: true,
      summary: { ...totals, avgVisitorsPerDay, avgPageViewsPerVisitor },
      entries,
      pageViewsByPage,
      totalDays: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

const recordEvent = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { type } = req.body; // 'visit', 'pageview', 'interaction'
    let entry = await Analytics.findOne({ date: today });
    if (!entry) {
      entry = await Analytics.create({ date: today });
    }
    if (type === 'visit') entry.visitors += 1;
    else if (type === 'pageview') {
      entry.pageViews += 1;
      const page = req.body.page || 'unknown';
      const details = entry.pageViewDetails || {};
      details[page] = (details[page] || 0) + 1;
      entry.pageViewDetails = details;
    } else if (type === 'interaction') {
      entry.interactions += 1;
    }
    await entry.save();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, recordEvent };
