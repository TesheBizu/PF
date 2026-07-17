const { BetaAnalyticsDataClient } = require('@google-analytics/data');

let analyticsDataClient = null;
let propertyId = null;

function getClient() {
  if (analyticsDataClient) return { client: analyticsDataClient, propertyId };

  if (!process.env.GA_PROPERTY_ID) {
    throw new Error('GA_PROPERTY_ID is not set in environment variables');
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY) are not set');
  }

  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  propertyId = process.env.GA_PROPERTY_ID;
  return { client: analyticsDataClient, propertyId };
}

const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

function getCacheKey(method, params) {
  return `${method}:${JSON.stringify(params)}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache() {
  cache.clear();
}

function formatDate(date) {
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 10);
}

function getDateRange(preset) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (preset) {
    case 'today':
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case 'yesterday':
      return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
    case '7days':
      return { startDate: formatDate(new Date(today.setDate(today.getDate() - 6))), endDate: formatDate(new Date()) };
    case '30days':
      return { startDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 29))), endDate: formatDate(new Date()) };
    case '90days':
      return { startDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 89))), endDate: formatDate(new Date()) };
    case '12months':
      return { startDate: formatDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1))), endDate: formatDate(new Date()) };
    case 'custom':
      return null;
    default:
      return { startDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 29))), endDate: formatDate(new Date()) };
  }
}

async function runReport({ metrics, dimensions = [], dateRange, dimensionFilter, orderBys = [], limit = null, offset = 0 }) {
  const { client, propertyId: pid } = getClient();
  const cacheKey = getCacheKey('runReport', { metrics, dimensions, dateRange, dimensionFilter, orderBys, limit, offset });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const request = {
    property: `properties/${pid}`,
    dateRanges: [dateRange],
    metrics: metrics.map((m) => ({ name: m })),
    dimensions: dimensions.map((d) => ({ name: d })),
  };

  if (dimensionFilter) {
    request.dimensionFilter = dimensionFilter;
  }

  if (orderBys.length > 0) {
    request.orderBys = orderBys;
  }

  if (limit) {
    request.limit = limit;
    request.offset = offset;
  }

  const [response] = await client.runReport(request);
  setCache(cacheKey, response);
  return response;
}

async function runRealtimeReport({ metrics, dimensions = [], limit = 10 }) {
  const { client, propertyId: pid } = getClient();

  const request = {
    property: `properties/${pid}`,
    metrics: metrics.map((m) => ({ name: m })),
    dimensions: dimensions.map((d) => ({ name: d })),
    limit,
  };

  const [response] = await client.runRealtimeReport(request);
  return response;
}

function parseReportResponse(response) {
  const rows = response.rows || [];
  const dimensionHeaders = (response.dimensionHeaders || []).map((h) => h.name);
  const metricHeaders = (response.metricHeaders || []).map((h) => h.name);

  return rows.map((row) => {
    const dimensions = {};
    dimensionHeaders.forEach((header, i) => {
      dimensions[header] = row.dimensionValues?.[i]?.value || '';
    });
    const metrics = {};
    metricHeaders.forEach((header, i) => {
      metrics[header] = parseFloat(row.metricValues?.[i]?.value || '0');
    });
    return { ...dimensions, ...metrics };
  });
}

function parseTotals(response) {
  const totals = response.totals?.[0];
  if (!totals) return {};
  const metricHeaders = (response.metricHeaders || []).map((h) => h.name);
  const result = {};
  metricHeaders.forEach((header, i) => {
    result[header] = parseFloat(totals.metricValues?.[i]?.value || '0');
  });
  return result;
}

module.exports = {
  getClient,
  clearCache,
  getDateRange,
  formatDate,
  runReport,
  runRealtimeReport,
  parseReportResponse,
  parseTotals,
};
