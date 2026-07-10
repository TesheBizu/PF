const Analytics = require('../models/Analytics');
const { getIO } = require('../socket');

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
        acc.socialLinkClicks += cur.socialLinkClicks || 0;
        acc.testimonialConversions += cur.testimonialConversions || 0;
        acc.contactSubmissions += cur.contactSubmissions || 0;
        return acc;
      },
      { visitors: 0, uniqueUsers: 0, pageViews: 0, interactions: 0, socialLinkClicks: 0, testimonialConversions: 0, contactSubmissions: 0 }
    );
    const pageViewsByPage = {};
    const trafficSources = {};
    const devices = {};
    const browsers = {};
    const geo = {};
    entries.forEach((entry) => {
      if (entry.pageViewDetails) {
        for (const [page, count] of Object.entries(entry.pageViewDetails.toObject())) {
          pageViewsByPage[page] = (pageViewsByPage[page] || 0) + count;
        }
      }
      if (entry.trafficSources) {
        for (const [source, count] of Object.entries(entry.trafficSources.toObject())) {
          trafficSources[source] = (trafficSources[source] || 0) + count;
        }
      }
      if (entry.devices) {
        for (const [device, count] of Object.entries(entry.devices.toObject())) {
          devices[device] = (devices[device] || 0) + count;
        }
      }
      if (entry.browsers) {
        for (const [browser, count] of Object.entries(entry.browsers.toObject())) {
          browsers[browser] = (browsers[browser] || 0) + count;
        }
      }
      if (entry.geo) {
        for (const [loc, count] of Object.entries(entry.geo.toObject())) {
          geo[loc] = (geo[loc] || 0) + count;
        }
      }
    });
    const avgVisitorsPerDay = entries.length ? Math.round(totals.visitors / entries.length) : 0;
    const avgPageViewsPerVisitor = totals.visitors ? (totals.pageViews / totals.visitors).toFixed(1) : '0.0';
    const visitorValues = entries.map((e) => e.visitors);
    const pageViewValues = entries.map((e) => e.pageViews);
    const currentMonth = entries.slice(-30);
    const prevMonth = entries.slice(-60, -30);
    const sumVisitors = (arr) => arr.reduce((s, e) => s + e.visitors, 0);
    const currentTotal = sumVisitors(currentMonth);
    const prevTotal = sumVisitors(prevMonth);
    const growthRate = prevTotal > 0 ? (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(1) : 0;
    const trends = entries.length > 1 ? computeTrends(entries) : null;
    const spikes = entries.length > 1 ? detectSpikes(entries) : [];
    res.status(200).json({
      success: true,
      summary: { ...totals, avgVisitorsPerDay, avgPageViewsPerVisitor, growthRate: parseFloat(growthRate) },
      entries,
      pageViewsByPage,
      trafficSources,
      devices,
      browsers,
      geo,
      totalDays: entries.length,
      trends,
      spikes,
    });
  } catch (error) {
    next(error);
  }
};

function computeTrends(entries) {
  const vals = entries.map((e) => e.visitors);
  const n = vals.length;
  const xMean = (n - 1) / 2;
  const yMean = vals.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (vals[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const direction = slope > 1 ? 'up' : slope < -1 ? 'down' : 'stable';
  const label = direction === 'up' ? 'Growing' : direction === 'down' ? 'Declining' : 'Stable';
  return { slope, direction, label, strength: Math.abs(slope) > 3 ? 'strong' : Math.abs(slope) > 1 ? 'moderate' : 'weak' };
}

function detectSpikes(entries) {
  const vals = entries.map((e) => e.visitors);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
  const threshold = 2;
  return entries.filter((e) => e.visitors > 0 && Math.abs(e.visitors - mean) > threshold * std).map((e) => ({
    date: e.date,
    visitors: e.visitors,
    type: e.visitors > mean ? 'spike' : 'drop',
    deviation: ((e.visitors - mean) / mean * 100).toFixed(1),
  }));
}

const getAnalyticsDetail = async (req, res, next) => {
  try {
    const { days = 30, type } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));
    const sinceStr = since.toISOString().slice(0, 10);
    const entries = await Analytics.find({ date: { $gte: sinceStr } }).sort({ date: 1 });
    let data;
    switch (type) {
      case 'traffic':
        data = {};
        entries.forEach((e) => {
          if (e.trafficSources) {
            for (const [k, v] of Object.entries(e.trafficSources.toObject())) {
              data[k] = (data[k] || 0) + v;
            }
          }
        });
        break;
      case 'devices':
        data = {};
        entries.forEach((e) => {
          if (e.devices) {
            for (const [k, v] of Object.entries(e.devices.toObject())) {
              data[k] = (data[k] || 0) + v;
            }
          }
        });
        break;
      case 'geo':
        data = {};
        entries.forEach((e) => {
          if (e.geo) {
            for (const [k, v] of Object.entries(e.geo.toObject())) {
              data[k] = (data[k] || 0) + v;
            }
          }
        });
        break;
      case 'browsers':
        data = {};
        entries.forEach((e) => {
          if (e.browsers) {
            for (const [k, v] of Object.entries(e.browsers.toObject())) {
              data[k] = (data[k] || 0) + v;
            }
          }
        });
        break;
      default:
        data = entries;
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const exportAnalytics = async (req, res, next) => {
  try {
    const { days = 30, format = 'csv' } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));
    const sinceStr = since.toISOString().slice(0, 10);
    const entries = await Analytics.find({ date: { $gte: sinceStr } }).sort({ date: 1 });
    if (format === 'csv') {
      const headers = 'Date,Visitors,Unique Users,Page Views,Interactions,Social Clicks,Contact Submissions,Traffic Sources,Devices,Browsers';
      const rows = entries.map((e) => {
        const ts = JSON.stringify(Object.fromEntries(e.trafficSources || new Map()));
        const dv = JSON.stringify(Object.fromEntries(e.devices || new Map()));
        const br = JSON.stringify(Object.fromEntries(e.browsers || new Map()));
        return `${e.date},${e.visitors},${e.uniqueUsers || 0},${e.pageViews},${e.interactions},${e.socialLinkClicks || 0},${e.contactSubmissions || 0},"${ts}","${dv}","${br}"`;
      });
      const csv = [headers, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${days}d.csv`);
      return res.status(200).send(csv);
    }
    res.status(200).json({ success: true, entries });
  } catch (error) {
    next(error);
  }
};

const recordEvent = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { type, page, source, device, browser, geo: geoLoc, isNewVisitor, platform: socialPlatform } = req.body;

    let entry = await Analytics.findOne({ date: today });
    const wasNewDay = !entry;
    if (!entry) {
      entry = await Analytics.create({ date: today });
    }

    switch (type) {
      case 'visit': {
        entry.visitors += 1;
        if (isNewVisitor) entry.uniqueUsers += 1;
        if (source) {
          const sources = entry.trafficSources || new Map();
          sources.set(source, (sources.get(source) || 0) + 1);
          entry.trafficSources = sources;
        }
        if (device) {
          const devMap = entry.devices || new Map();
          devMap.set(device, (devMap.get(device) || 0) + 1);
          entry.devices = devMap;
        }
        if (browser) {
          const brMap = entry.browsers || new Map();
          brMap.set(browser, (brMap.get(browser) || 0) + 1);
          entry.browsers = brMap;
        }
        if (geoLoc) {
          const geoMap = entry.geo || new Map();
          geoMap.set(geoLoc, (geoMap.get(geoLoc) || 0) + 1);
          entry.geo = geoMap;
        }
        console.log(`${LOG_PREFIX} Visit recorded — visitors:${entry.visitors}, unique:${entry.uniqueUsers}, source:${source || '—'}, device:${device || '—'}, browser:${browser || '—'}`);
        break;
      }
      case 'pageview': {
        entry.pageViews += 1;
        const p = page || 'unknown';
        const details = entry.pageViewDetails || new Map();
        details.set(p, (details.get(p) || 0) + 1);
        entry.pageViewDetails = details;
        console.log(`${LOG_PREFIX} Pageview — ${p} (total:${entry.pageViews})`);
        break;
      }
      case 'interaction': {
        entry.interactions += 1;
        console.log(`${LOG_PREFIX} Interaction recorded (total:${entry.interactions})`);
        break;
      }
      case 'socialClick': {
        entry.socialLinkClicks = (entry.socialLinkClicks || 0) + 1;
        console.log(`${LOG_PREFIX} Social click — ${socialPlatform || 'unknown'} (total:${entry.socialLinkClicks})`);
        break;
      }
      case 'contactSubmission': {
        entry.contactSubmissions = (entry.contactSubmissions || 0) + 1;
        console.log(`${LOG_PREFIX} Contact submission (total:${entry.contactSubmissions})`);
        break;
      }
      default:
        console.log(`${LOG_PREFIX} Unknown event type: ${type}`);
        return res.status(400).json({ success: false, message: `Unknown event type: ${type}` });
    }

    await entry.save();

    const changed = {};
    changed[type] = true;
    if (wasNewDay) changed.newDay = true;
    try {
      getIO().emit('analytics:stats', {
        type,
        date: today,
        page: type === 'pageview' ? page : undefined,
        isNewVisitor: type === 'visit' ? isNewVisitor : undefined,
        socialPlatform: type === 'socialClick' ? socialPlatform : undefined,
        uniqueUsersToday: entry.uniqueUsers,
        visitorsToday: entry.visitors,
        pageViewsToday: entry.pageViews,
        interactionsToday: entry.interactions,
      });
    } catch (socketErr) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`${LOG_PREFIX} Socket emission failed:`, socketErr.message);
      }
    }

    res.status(200).json({ success: true, date: today });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error recording event:`, error.message);
    next(error);
  }
};

module.exports = { getAnalytics, getAnalyticsDetail, exportAnalytics, recordEvent };
