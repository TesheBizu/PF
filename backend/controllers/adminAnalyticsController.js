const ga4 = require('../services/ga4Service');
const Analytics = require('../models/Analytics');

function getDateRange(preset) {
  if (preset === 'custom') return null;
  return ga4.getDateRange(preset);
}

function formatDate(d) {
  return ga4.formatDate(d);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ga4.formatDate(d);
}

async function getAnalyticsFromDB(preset) {
  const range = getDateRange(preset);
  if (!range) return null;
  const entries = await Analytics.find({ date: { $gte: range.startDate, $lte: range.endDate } }).sort({ date: 1 });
  if (!entries.length) return null;

  const totals = entries.reduce(
    (acc, e) => {
      acc.visitors += e.visitors || 0;
      acc.uniqueUsers += e.uniqueUsers || 0;
      acc.pageViews += e.pageViews || 0;
      acc.interactions += e.interactions || 0;
      acc.contactSubmissions += e.contactSubmissions || 0;
      acc.socialLinkClicks += e.socialLinkClicks || 0;

      if (e.devices) {
        Object.entries(e.devices instanceof Map ? Object.fromEntries(e.devices) : e.devices).forEach(([k, v]) => {
          acc.devices[k] = (acc.devices[k] || 0) + v;
        });
      }
      if (e.browsers) {
        Object.entries(e.browsers instanceof Map ? Object.fromEntries(e.browsers) : e.browsers).forEach(([k, v]) => {
          acc.browsers[k] = (acc.browsers[k] || 0) + v;
        });
      }
      if (e.trafficSources) {
        Object.entries(e.trafficSources instanceof Map ? Object.fromEntries(e.trafficSources) : e.trafficSources).forEach(([k, v]) => {
          acc.trafficSources[k] = (acc.trafficSources[k] || 0) + v;
        });
      }
      return acc;
    },
    { visitors: 0, uniqueUsers: 0, pageViews: 0, interactions: 0, contactSubmissions: 0, socialLinkClicks: 0, devices: {}, browsers: {}, trafficSources: {} }
  );

  return { entries, totals };
}

function trendFromDB(entries, metric) {
  return entries.map((e) => ({ date: e.date, value: e[metric] || 0 }));
}

function emptyOverview() {
  return {
    totalUsers: 0, activeUsers: 0, newUsers: 0, sessions: 0,
    engagedSessions: 0, pageViews: 0, averageSessionDuration: 0,
    bounceRate: 0, engagementRate: 0, contactSubmissions: 0,
    resumeDownloads: 0, projectClicks: 0,
  };
}

const getOverview = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;

    if (ga4.isAvailable()) {
      try {
        const range = preset === 'custom' && startDate && endDate
          ? { startDate, endDate }
          : ga4.getDateRange(preset);

        const [activeUsersRes, newUsersRes, sessionsRes, pageviewsRes, engagedSessionsRes, avgSessionDurRes, bounceRateRes, engagementRateRes] = await Promise.all([
          ga4.runReport({ metrics: ['activeUsers'], dateRange: range }),
          ga4.runReport({ metrics: ['newUsers'], dateRange: range }),
          ga4.runReport({ metrics: ['sessions'], dateRange: range }),
          ga4.runReport({ metrics: ['screenPageViews'], dateRange: range }),
          ga4.runReport({ metrics: ['engagedSessions'], dateRange: range }),
          ga4.runReport({ metrics: ['averageSessionDuration'], dateRange: range }),
          ga4.runReport({ metrics: ['bounceRate'], dateRange: range }),
          ga4.runReport({ metrics: ['engagementRate'], dateRange: range }),
        ]);

        const activeUsers = ga4.parseTotals(activeUsersRes);
        const newUsers = ga4.parseTotals(newUsersRes);
        const sessions = ga4.parseTotals(sessionsRes);
        const pageviews = ga4.parseTotals(pageviewsRes);
        const engagedSessions = ga4.parseTotals(engagedSessionsRes);
        const avgSessionDuration = ga4.parseTotals(avgSessionDurRes);
        const bounceRate = ga4.parseTotals(bounceRateRes);
        const engagementRate = ga4.parseTotals(engagementRateRes);

        let contactSubmissions = 0;
        let resumeDownloads = 0;
        let projectClicks = 0;

        try {
          const [contactRes, resumeRes, projectRes] = await Promise.all([
            ga4.runReport({ metrics: ['eventCount'], dateRange: range, dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'contact_form_submit' } } } }),
            ga4.runReport({ metrics: ['eventCount'], dateRange: range, dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'resume_download' } } } }),
            ga4.runReport({ metrics: ['eventCount'], dateRange: range, dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'project_click' } } } }),
          ]);
          contactSubmissions = ga4.parseTotals(contactRes).eventCount || 0;
          resumeDownloads = ga4.parseTotals(resumeRes).eventCount || 0;
          projectClicks = ga4.parseTotals(projectRes).eventCount || 0;
        } catch (_) {}

        return res.status(200).json({
          success: true,
          source: 'ga4',
          data: {
            totalUsers: activeUsers.activeUsers || 0,
            activeUsers: activeUsers.activeUsers || 0,
            newUsers: newUsers.newUsers || 0,
            sessions: sessions.sessions || 0,
            engagedSessions: engagedSessions.engagedSessions || 0,
            pageViews: pageviews.screenPageViews || 0,
            averageSessionDuration: avgSessionDuration.averageSessionDuration || 0,
            bounceRate: bounceRate.bounceRate || 0,
            engagementRate: engagementRate.engagementRate || 0,
            contactSubmissions,
            resumeDownloads,
            projectClicks,
          },
        });
      } catch (ga4Err) {
        console.warn('[Analytics] GA4 overview failed, falling back to DB:', ga4Err.message);
      }
    }

    const db = await getAnalyticsFromDB(preset);
    if (db) {
      return res.status(200).json({
        success: true,
        source: 'database',
        data: {
          totalUsers: db.totals.uniqueUsers || db.totals.visitors,
          activeUsers: db.totals.visitors,
          newUsers: db.totals.uniqueUsers,
          sessions: db.totals.visitors,
          engagedSessions: 0,
          pageViews: db.totals.pageViews,
          averageSessionDuration: 0,
          bounceRate: 0,
          engagementRate: 0,
          contactSubmissions: db.totals.contactSubmissions,
          resumeDownloads: 0,
          projectClicks: db.totals.interactions,
        },
      });
    }

    res.status(200).json({ success: true, source: 'empty', data: emptyOverview() });
  } catch (error) {
    next(error);
  }
};

const getRealtime = async (req, res, next) => {
  if (ga4.isAvailable()) {
    try {
      const [activeUsersRes, pageRes, countryRes, deviceRes, eventRes] = await Promise.all([
        ga4.runRealtimeReport({ metrics: ['activeUsers'] }),
        ga4.runRealtimeReport({ metrics: ['screenPageViews'], dimensions: ['pagePath'], limit: 10 }),
        ga4.runRealtimeReport({ metrics: ['activeUsers'], dimensions: ['country'], limit: 10 }),
        ga4.runRealtimeReport({ metrics: ['activeUsers'], dimensions: ['deviceCategory'], limit: 5 }),
        ga4.runRealtimeReport({ metrics: ['eventCount'], dimensions: ['eventName'], limit: 20 }),
      ]);

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          activeUsers: ga4.parseTotals(activeUsersRes).activeUsers || 0,
          pages: ga4.parseReportResponse(pageRes).map((r) => ({ path: r.pagePath, views: r.screenPageViews })),
          countries: ga4.parseReportResponse(countryRes).map((r) => ({ country: r.country, users: r.activeUsers })),
          devices: ga4.parseReportResponse(deviceRes).map((r) => ({ device: r.deviceCategory, users: r.activeUsers })),
          events: ga4.parseReportResponse(eventRes).map((r) => ({ name: r.eventName, count: r.eventCount })),
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 realtime failed, falling back to DB:', ga4Err.message);
    }
  }

  try {
    const today = formatDate(new Date());
    const entry = await Analytics.findOne({ date: today });
    const activeSessions = entry ? entry.visitors || 0 : 0;
    const pageViews = entry ? entry.pageViews || 0 : 0;
    const devices = entry ? (entry.devices instanceof Map ? Object.fromEntries(entry.devices) : entry.devices || {}) : {};
    const browsers = entry ? (entry.browsers instanceof Map ? Object.fromEntries(entry.browsers) : entry.browsers || {}) : {};

    return res.status(200).json({
      success: true,
      source: 'database',
      data: {
        activeUsers: activeSessions,
        pages: [{ path: '/', views: pageViews }],
        countries: [],
        devices: Object.entries(devices).map(([device, users]) => ({ device, users })),
        events: [],
      },
    });
  } catch (_) {
    res.status(200).json({ success: true, source: 'empty', data: { activeUsers: 0, pages: [], countries: [], devices: [], events: [] } });
  }
};

const getTraffic = async (req, res, next) => {
  const { preset = '30days', startDate, endDate } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);

      const [channelRes, sourceRes, mediumRes] = await Promise.all([
        ga4.runReport({ metrics: ['sessions', 'activeUsers'], dimensions: ['sessionDefaultChannelGroup'], dateRange: range, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }),
        ga4.runReport({ metrics: ['sessions'], dimensions: ['sessionSource'], dateRange: range, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 20 }),
        ga4.runReport({ metrics: ['sessions'], dimensions: ['sessionMedium'], dateRange: range, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }),
      ]);

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          channels: ga4.parseReportResponse(channelRes).map((r) => ({ name: r.sessionDefaultChannelGroup, sessions: r.sessions, users: r.activeUsers })),
          sources: ga4.parseReportResponse(sourceRes).map((r) => ({ name: r.sessionSource, sessions: r.sessions })),
          mediums: ga4.parseReportResponse(mediumRes).map((r) => ({ name: r.sessionMedium, sessions: r.sessions })),
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 traffic failed, falling back to DB:', ga4Err.message);
    }
  }

  const db = await getAnalyticsFromDB(preset);
  const sources = db ? Object.entries(db.totals.trafficSources).map(([name, sessions]) => ({ name, sessions })) : [];
  res.status(200).json({
    success: true,
    source: 'database',
    data: {
      channels: sources.map((s) => ({ name: s.name, sessions: s.sessions, users: s.sessions })),
      sources,
      mediums: [],
    },
  });
};

const getPages = async (req, res, next) => {
  const { preset = '30days', startDate, endDate } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);
      const response = await ga4.runReport({
        metrics: ['screenPageViews', 'activeUsers', 'averageSessionDuration', 'bounceRate'],
        dimensions: ['pagePath', 'pageTitle'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 50,
      });

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: ga4.parseReportResponse(response).map((r) => ({
          path: r.pagePath, title: r.pageTitle, views: r.screenPageViews,
          users: r.activeUsers, avgDuration: r.averageSessionDuration, bounceRate: r.bounceRate,
        })),
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 pages failed, falling back to DB:', ga4Err.message);
    }
  }

  const db = await getAnalyticsFromDB(preset);
  const pages = [];
  if (db?.entries) {
    const pageMap = {};
    db.entries.forEach((e) => {
      const pvd = e.pageViewDetails instanceof Map ? Object.fromEntries(e.pageViewDetails) : e.pageViewDetails || {};
      Object.entries(pvd).forEach(([path, views]) => {
        pageMap[path] = (pageMap[path] || 0) + views;
      });
    });
    Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([path, views]) => {
        pages.push({ path, title: '', views, users: 0, avgDuration: 0, bounceRate: 0 });
      });
  }
  res.status(200).json({ success: true, source: 'database', data: pages });
};

const getDevices = async (req, res, next) => {
  const { preset = '30days', startDate, endDate } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);

      const [deviceRes, browserRes, osRes, screenRes] = await Promise.all([
        ga4.runReport({ metrics: ['activeUsers', 'sessions'], dimensions: ['deviceCategory'], dateRange: range }),
        ga4.runReport({ metrics: ['activeUsers'], dimensions: ['browser'], dateRange: range, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 15 }),
        ga4.runReport({ metrics: ['activeUsers'], dimensions: ['operatingSystem'], dateRange: range, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 15 }),
        ga4.runReport({ metrics: ['activeUsers'], dimensions: ['screenResolution'], dateRange: range, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 15 }),
      ]);

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          devices: ga4.parseReportResponse(deviceRes).map((r) => ({ name: r.deviceCategory, users: r.activeUsers, sessions: r.sessions })),
          browsers: ga4.parseReportResponse(browserRes).map((r) => ({ name: r.browser, users: r.activeUsers })),
          operatingSystems: ga4.parseReportResponse(osRes).map((r) => ({ name: r.operatingSystem, users: r.activeUsers })),
          screenResolutions: ga4.parseReportResponse(screenRes).map((r) => ({ name: r.screenResolution, users: r.activeUsers })),
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 devices failed, falling back to DB:', ga4Err.message);
    }
  }

  const db = await getAnalyticsFromDB(preset);
  const devices = db ? Object.entries(db.totals.devices).map(([name, users]) => ({ name, users, sessions: users })) : [];
  const browsers = db ? Object.entries(db.totals.browsers).map(([name, users]) => ({ name, users })) : [];
  res.status(200).json({
    success: true,
    source: 'database',
    data: { devices, browsers, operatingSystems: [], screenResolutions: [] },
  });
};

const getCountries = async (req, res, next) => {
  const { preset = '30days', startDate, endDate } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);

      const [countryRes, cityRes] = await Promise.all([
        ga4.runReport({ metrics: ['activeUsers', 'sessions'], dimensions: ['country'], dateRange: range, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 50 }),
        ga4.runReport({ metrics: ['activeUsers'], dimensions: ['city', 'country'], dateRange: range, orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 50 }),
      ]);

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          countries: ga4.parseReportResponse(countryRes).map((r) => ({ name: r.country, users: r.activeUsers, sessions: r.sessions })),
          cities: ga4.parseReportResponse(cityRes).map((r) => ({ name: r.city, country: r.country, users: r.activeUsers })),
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 countries failed, falling back to DB:', ga4Err.message);
    }
  }

  const db = await getAnalyticsFromDB(preset);
  const geo = db ? Object.entries(db.entries.reduce((acc, e) => {
    const g = e.geo instanceof Map ? Object.fromEntries(e.geo) : e.geo || {};
    Object.entries(g).forEach(([k, v]) => { acc[k] = (acc[k] || 0) + v; });
    return acc;
  }, {})).map(([name, users]) => ({ name, users, sessions: users })) : [];

  res.status(200).json({ success: true, source: 'database', data: { countries: geo, cities: [] } });
};

const getEvents = async (req, res, next) => {
  const { preset = '30days', startDate, endDate } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);

      const [eventRes] = await Promise.all([
        ga4.runReport({
          metrics: ['eventCount', 'eventCountPerUser'],
          dimensions: ['eventName'],
          dateRange: range,
          orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
          limit: 50,
        }),
      ]);

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          allEvents: ga4.parseReportResponse(eventRes).map((r) => ({
            name: r.eventName, count: r.eventCount, countPerUser: r.eventCountPerUser,
          })),
          customEvents: {},
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 events failed, falling back to DB:', ga4Err.message);
    }
  }

  res.status(200).json({ success: true, source: 'database', data: { allEvents: [], customEvents: {} } });
};

const getTrend = async (req, res, next) => {
  const { preset = '30days', startDate, endDate, metric = 'activeUsers' } = req.query;

  if (ga4.isAvailable()) {
    try {
      const range = preset === 'custom' && startDate && endDate ? { startDate, endDate } : ga4.getDateRange(preset);

      const response = await ga4.runReport({
        metrics: [metric],
        dimensions: ['date'],
        dateRange: range,
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      });

      return res.status(200).json({
        success: true,
        source: 'ga4',
        data: {
          metric,
          values: ga4.parseReportResponse(response).map((r) => ({ date: r.date, value: r[metric] })),
        },
      });
    } catch (ga4Err) {
      console.warn('[Analytics] GA4 trend failed, falling back to DB:', ga4Err.message);
    }
  }

  const db = await getAnalyticsFromDB(preset);
  const metricKey = metric === 'activeUsers' ? 'visitors' : metric;
  const values = db ? trendFromDB(db.entries, metricKey) : [];
  res.status(200).json({ success: true, source: 'database', data: { metric, values } });
};

module.exports = {
  getOverview,
  getRealtime,
  getTraffic,
  getPages,
  getDevices,
  getCountries,
  getEvents,
  getTrend,
};
