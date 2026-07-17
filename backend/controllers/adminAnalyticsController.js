const ga4 = require('../services/ga4Service');

const getOverview = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
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

    const totalUsers = activeUsers.activeUsers || 0;

    let contactSubmissions = 0;
    let resumeDownloads = 0;
    let projectClicks = 0;

    try {
      const [contactRes, resumeRes, projectRes] = await Promise.all([
        ga4.runReport({
          metrics: ['eventCount'],
          dateRange: range,
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'EXACT', value: 'contact_form_submit' },
            },
          },
        }),
        ga4.runReport({
          metrics: ['eventCount'],
          dateRange: range,
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'EXACT', value: 'resume_download' },
            },
          },
        }),
        ga4.runReport({
          metrics: ['eventCount'],
          dateRange: range,
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: { matchType: 'EXACT', value: 'project_click' },
            },
          },
        }),
      ]);
      contactSubmissions = ga4.parseTotals(contactRes).eventCount || 0;
      resumeDownloads = ga4.parseTotals(resumeRes).eventCount || 0;
      projectClicks = ga4.parseTotals(projectRes).eventCount || 0;
    } catch (_) {}

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
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
  } catch (error) {
    next(error);
  }
};

const getRealtime = async (req, res, next) => {
  try {
    const [activeUsersRes, pageRes, countryRes, deviceRes, eventRes] = await Promise.all([
      ga4.runRealtimeReport({ metrics: ['activeUsers'] }),
      ga4.runRealtimeReport({ metrics: ['screenPageViews'], dimensions: ['pagePath'], limit: 10 }),
      ga4.runRealtimeReport({ metrics: ['activeUsers'], dimensions: ['country'], limit: 10 }),
      ga4.runRealtimeReport({ metrics: ['activeUsers'], dimensions: ['deviceCategory'], limit: 5 }),
      ga4.runRealtimeReport({ metrics: ['eventCount'], dimensions: ['eventName'], limit: 20 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeUsers: ga4.parseTotals(activeUsersRes).activeUsers || 0,
        pages: ga4.parseReportResponse(pageRes).map((r) => ({
          path: r.pagePath,
          views: r.screenPageViews,
        })),
        countries: ga4.parseReportResponse(countryRes).map((r) => ({
          country: r.country,
          users: r.activeUsers,
        })),
        devices: ga4.parseReportResponse(deviceRes).map((r) => ({
          device: r.deviceCategory,
          users: r.activeUsers,
        })),
        events: ga4.parseReportResponse(eventRes).map((r) => ({
          name: r.eventName,
          count: r.eventCount,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTraffic = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const [channelRes, sourceRes, mediumRes] = await Promise.all([
      ga4.runReport({
        metrics: ['sessions', 'activeUsers'],
        dimensions: ['sessionDefaultChannelGroup'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      ga4.runReport({
        metrics: ['sessions'],
        dimensions: ['sessionSource'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      }),
      ga4.runReport({
        metrics: ['sessions'],
        dimensions: ['sessionMedium'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        channels: ga4.parseReportResponse(channelRes).map((r) => ({
          name: r.sessionDefaultChannelGroup,
          sessions: r.sessions,
          users: r.activeUsers,
        })),
        sources: ga4.parseReportResponse(sourceRes).map((r) => ({
          name: r.sessionSource,
          sessions: r.sessions,
        })),
        mediums: ga4.parseReportResponse(mediumRes).map((r) => ({
          name: r.sessionMedium,
          sessions: r.sessions,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPages = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const response = await ga4.runReport({
      metrics: ['screenPageViews', 'activeUsers', 'averageSessionDuration', 'bounceRate'],
      dimensions: ['pagePath', 'pageTitle'],
      dateRange: range,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 50,
    });

    res.status(200).json({
      success: true,
      data: ga4.parseReportResponse(response).map((r) => ({
        path: r.pagePath,
        title: r.pageTitle,
        views: r.screenPageViews,
        users: r.activeUsers,
        avgDuration: r.averageSessionDuration,
        bounceRate: r.bounceRate,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getDevices = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const [deviceRes, browserRes, osRes, screenRes] = await Promise.all([
      ga4.runReport({
        metrics: ['activeUsers', 'sessions'],
        dimensions: ['deviceCategory'],
        dateRange: range,
      }),
      ga4.runReport({
        metrics: ['activeUsers'],
        dimensions: ['browser'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15,
      }),
      ga4.runReport({
        metrics: ['activeUsers'],
        dimensions: ['operatingSystem'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15,
      }),
      ga4.runReport({
        metrics: ['activeUsers'],
        dimensions: ['screenResolution'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        devices: ga4.parseReportResponse(deviceRes).map((r) => ({
          name: r.deviceCategory,
          users: r.activeUsers,
          sessions: r.sessions,
        })),
        browsers: ga4.parseReportResponse(browserRes).map((r) => ({
          name: r.browser,
          users: r.activeUsers,
        })),
        operatingSystems: ga4.parseReportResponse(osRes).map((r) => ({
          name: r.operatingSystem,
          users: r.activeUsers,
        })),
        screenResolutions: ga4.parseReportResponse(screenRes).map((r) => ({
          name: r.screenResolution,
          users: r.activeUsers,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCountries = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const [countryRes, cityRes] = await Promise.all([
      ga4.runReport({
        metrics: ['activeUsers', 'sessions'],
        dimensions: ['country'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 50,
      }),
      ga4.runReport({
        metrics: ['activeUsers'],
        dimensions: ['city', 'country'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 50,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        countries: ga4.parseReportResponse(countryRes).map((r) => ({
          name: r.country,
          users: r.activeUsers,
          sessions: r.sessions,
        })),
        cities: ga4.parseReportResponse(cityRes).map((r) => ({
          name: r.city,
          country: r.country,
          users: r.activeUsers,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const [eventRes, customEventRes] = await Promise.all([
      ga4.runReport({
        metrics: ['eventCount', 'eventCountPerUser'],
        dimensions: ['eventName'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 50,
      }),
      ga4.runReport({
        metrics: ['eventCount'],
        dimensions: ['eventName', 'date'],
        dateRange: range,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: [
                'hero_cta_click', 'project_click', 'project_demo_click',
                'github_link_click', 'contact_form_submit', 'resume_download',
                'email_click', 'phone_click', 'whatsapp_click',
                'linkedin_click', 'github_profile_click', 'theme_toggle',
                'scroll_depth_25', 'scroll_depth_50', 'scroll_depth_75', 'scroll_depth_100',
                'section_view_hero', 'section_view_about', 'section_view_skills',
                'section_view_projects', 'section_view_experience',
                'section_view_testimonials', 'section_view_contact',
              ],
            },
          },
        },
        limit: 200,
      }),
    ]);

    const allEvents = ga4.parseReportResponse(eventRes).map((r) => ({
      name: r.eventName,
      count: r.eventCount,
      countPerUser: r.eventCountPerUser,
    }));

    const customEvents = ga4.parseReportResponse(customEventRes);

    const eventsByDate = {};
    customEvents.forEach((r) => {
      if (!eventsByDate[r.date]) eventsByDate[r.date] = {};
      eventsByDate[r.date][r.eventName] = r.eventCount;
    });

    res.status(200).json({
      success: true,
      data: {
        allEvents,
        customEvents: eventsByDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTrend = async (req, res, next) => {
  try {
    const { preset = '30days', startDate, endDate, metric = 'activeUsers' } = req.query;
    const range = preset === 'custom' && startDate && endDate
      ? { startDate, endDate }
      : ga4.getDateRange(preset);

    const response = await ga4.runReport({
      metrics: [metric],
      dimensions: ['date'],
      dateRange: range,
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    const data = ga4.parseReportResponse(response).map((r) => ({
      date: r.date,
      value: r[metric],
    }));

    res.status(200).json({
      success: true,
      data: { metric, values: data },
    });
  } catch (error) {
    next(error);
  }
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
