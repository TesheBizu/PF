const Analytics = require('../models/Analytics');

const activeSessions = new Map();
const BROADCAST_INTERVAL = 5000;
let broadcastTimer = null;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function incrementDevice(deviceType, ip) {
  const key = `device:${ip}`;
  if (!activeSessions.has(key)) activeSessions.set(key, { device: deviceType, seen: Date.now() });
  else activeSessions.get(key).device = deviceType;
}

function incrementBrowser(browser, ip) {
  const key = `browser:${ip}`;
  if (!activeSessions.has(key)) activeSessions.set(key, { browser, seen: Date.now() });
  else activeSessions.get(key).browser = browser;
}

async function trackEvent(event) {
  const date = todayStr();
  try {
    const update = {};
    switch (event.type) {
      case 'page_view':
        update.$inc = { visitors: 1, pageViews: 1 };
        if (!event.path) break;
        update.$inc[`pageViewDetails.${event.path}`] = 1;
        break;
      case 'interaction':
        update.$inc = { interactions: 1 };
        break;
      case 'contact_form_submit':
        update.$inc = { contactSubmissions: 1 };
        break;
      case 'resume_download':
        update.$inc = { interactions: 1 };
        break;
      case 'hero_cta_click':
      case 'project_click':
      case 'project_demo_click':
      case 'github_link_click':
        update.$inc = { interactions: 1 };
        break;
      case 'social_click':
      case 'email_click':
      case 'phone_click':
        update.$inc = { socialLinkClicks: 1, interactions: 1 };
        break;
      case 'theme_toggle':
      case 'scroll_depth':
      case 'section_view':
        update.$inc = { interactions: 1 };
        break;
      default:
        update.$inc = { interactions: 1 };
        break;
    }

    if (!update.$inc) return;

    if (event.device) incrementDevice(event.device, event.ip);
    if (event.browser) incrementBrowser(event.browser, event.ip);

    await Analytics.findOneAndUpdate({ date }, update, { upsert: true, new: true });
  } catch (err) {
    console.warn('[AnalyticsTracker] Failed to track event:', err.message);
  }
}

function getActiveVisitors() {
  const now = Date.now();
  const cutoff = 30 * 1000;
  for (const [key, val] of activeSessions) {
    if (now - val.seen > cutoff) activeSessions.delete(key);
  }

  const uniqueIPs = new Set();
  for (const [key] of activeSessions) {
    const ip = key.split(':')[1];
    uniqueIPs.add(ip);
  }

  const devices = {};
  const browsers = {};
  for (const [key, val] of activeSessions) {
    if (key.startsWith('device:')) {
      devices[val.device] = (devices[val.device] || 0) + 1;
    }
    if (key.startsWith('browser:')) {
      browsers[val.browser] = (browsers[val.browser] || 0) + 1;
    }
  }

  return {
    activeUsers: uniqueIPs.size,
    devices: Object.entries(devices).map(([device, users]) => ({ device, users })),
    browsers: Object.entries(browsers).map(([name, users]) => ({ name, users })),
  };
}

function computeStats() {
  const active = getActiveVisitors();
  return {
    activeUsers: active.activeUsers,
    devices: active.devices,
    browsers: active.browsers,
    timestamp: new Date().toISOString(),
  };
}

function setupSocketAnalytics(io) {
  const analyticsNs = io.of('/analytics');

  analyticsNs.on('connection', (socket) => {
    console.log('[Analytics] Client connected:', socket.id);

    socket.on('analytics:event', (event) => {
      if (!event || !event.type) return;
      trackEvent({ ...event, ip: socket.handshake.address });
    });

    socket.on('analytics:pageview', (data) => {
      trackEvent({ type: 'page_view', path: data?.path, device: data?.device, browser: data?.browser, ip: socket.handshake.address });
    });

    socket.on('analytics:interaction', (data) => {
      if (!data?.type) return;
      trackEvent({ type: data.type, device: data?.device, browser: data?.browser, ip: socket.handshake.address });
    });

    socket.emit('analytics:stats', computeStats());
  });

  if (broadcastTimer) clearInterval(broadcastTimer);
  broadcastTimer = setInterval(() => {
    const stats = computeStats();
    analyticsNs.emit('analytics:stats', stats);
  }, BROADCAST_INTERVAL);

  return analyticsNs;
}

function stopBroadcast() {
  if (broadcastTimer) {
    clearInterval(broadcastTimer);
    broadcastTimer = null;
  }
}

module.exports = { setupSocketAnalytics, trackEvent, getActiveVisitors, computeStats, stopBroadcast };
