import api from './api';

const VISITOR_ID_KEY = 'pf_visitor_id';
const VISIT_DATE_KEY = 'pf_visit_date';
const DEBUG = import.meta.env.MODE === 'development';

function generateId() {
  return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function isNewVisitToday() {
  const today = new Date().toISOString().slice(0, 10);
  const lastVisit = localStorage.getItem(VISIT_DATE_KEY);
  if (lastVisit !== today) {
    localStorage.setItem(VISIT_DATE_KEY, today);
    return true;
  }
  return false;
}

function detectBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('chrome') && !ua.includes('edg')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('edg')) return 'edge';
  return 'other';
}

function detectDevice() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

function detectSource() {
  const ref = document.referrer;
  if (!ref) return 'direct';
  try {
    const url = new URL(ref);
    const host = url.hostname;
    if (host.includes('google')) return 'organic';
    if (host.includes('facebook') || host.includes('twitter') || host.includes('linkedin') || host.includes('instagram')) return 'social';
    return 'referral';
  } catch {
    return 'referral';
  }
}

const log = (msg, data) => {
  if (DEBUG) console.log(`[Analytics] ${msg}`, data || '');
};

export async function trackVisit() {
  try {
    const visitorId = getVisitorId();
    const newVisit = isNewVisitToday();
    log('trackVisit', { visitorId, newVisit, device: detectDevice(), browser: detectBrowser(), source: detectSource() });
    const { data } = await api.post('/analytics/record', {
      type: 'visit',
      isNewVisitor: newVisit,
      visitorId,
      source: detectSource(),
      device: detectDevice(),
      browser: detectBrowser(),
    });
    log('trackVisit response', data);
    return data;
  } catch (err) {
    if (DEBUG) console.warn('[Analytics] trackVisit failed:', err.message);
  }
}

export async function trackPageView(page) {
  try {
    const visitorId = getVisitorId();
    log('trackPageView', { page, visitorId });
    const { data } = await api.post('/analytics/record', {
      type: 'pageview',
      page,
      visitorId,
    });
    return data;
  } catch (err) {
    if (DEBUG) console.warn('[Analytics] trackPageView failed:', err.message);
  }
}

export async function trackInteraction(type, metadata = {}) {
  try {
    log('trackInteraction', { type, metadata });
    const { data } = await api.post('/analytics/record', {
      type: 'interaction',
      interactionType: type,
      ...metadata,
    });
    return data;
  } catch (err) {
    if (DEBUG) console.warn('[Analytics] trackInteraction failed:', err.message);
  }
}

export async function trackSocialClick(platform) {
  try {
    log('trackSocialClick', { platform });
    const { data } = await api.post('/analytics/record', { type: 'socialClick', platform });
    return data;
  } catch (err) {
    if (DEBUG) console.warn('[Analytics] socialClick failed:', err.message);
  }
}

export async function trackContactSubmission() {
  try {
    log('trackContactSubmission');
    const { data } = await api.post('/analytics/record', { type: 'contactSubmission' });
    return data;
  } catch (err) {
    if (DEBUG) console.warn('[Analytics] contactSubmission failed:', err.message);
  }
}
