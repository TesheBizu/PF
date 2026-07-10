require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Analytics = require('./models/Analytics');

const LS = '[AnalyticsSeeder]';

const COUNTRIES = ['US', 'IN', 'ET', 'UK', 'DE', 'CA', 'NG', 'KE', 'EG', 'ZA', 'BR', 'JP', 'AU', 'FR', 'NL'];
const PAGES = ['/', '/about', '/projects', '/skills', '/contact', '/testimonials'];

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

async function seedAnalytics() {
  await connectDB();

  const existing = await Analytics.countDocuments({ isSeedData: true });
  if (existing > 0) {
    console.log(`${LS} ${existing} seeded records already exist. Delete them first or run with FORCE=true to re-seed.`);
    if (process.env.FORCE !== 'true') {
      console.log(`${LS} Set FORCE=true to delete existing seed data and re-seed.`);
      process.exit(0);
    }
    await Analytics.deleteMany({ isSeedData: true });
    console.log(`${LS} Deleted existing seed data.`);
  }

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 90);

  const days = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  console.log(`${LS} Generating ${days.length} days of analytics data (${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)})...`);

  const dayInMs = 24 * 60 * 60 * 1000;
  const totalDays = days.length;
  const seedOffset = 42;

  const batch = [];

  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const rng = () => seededRandom(seedOffset + i * 1000 + Math.floor(seededRandom(seedOffset + i * 13) * 1000));

    const progress = i / totalDays;
    const baseTraffic = 20 + progress * 40;
    const weekend = isWeekend(date);

    const dayOfWeek = new Date(date).getDay();
    let dayFactor = 1;
    if (weekend) dayFactor = 0.5 + rng() * 0.3;
    else if (dayOfWeek === 1) dayFactor = 0.85 + rng() * 0.3;
    else if (dayOfWeek === 5) dayFactor = 0.9 + rng() * 0.3;
    else dayFactor = 1 + rng() * 0.4;

    const spike = rng() > 0.95 ? 2 + rng() * 2 : 1;
    const holidayBonus = rng() > 0.97 ? 1.5 + rng() * 0.5 : 1;

    const visitors = Math.round(baseTraffic * dayFactor * spike * holidayBonus);
    const uniqueUsers = Math.round(visitors * (0.5 + rng() * 0.3));
    const pageViews = Math.round(visitors * (2 + rng() * 4));

    const sources = ['direct', 'organic', 'social', 'referral', 'email'];
    const sourceWeights = [0.35, 0.30, 0.15, 0.12, 0.08];
    const trafficSources = {};
    let remainingVisitors = visitors;
    for (let si = 0; si < sources.length; si++) {
      if (si === sources.length - 1) {
        trafficSources[sources[si]] = remainingVisitors;
      } else {
        const count = Math.round(visitors * sourceWeights[si] * (0.8 + rng() * 0.4));
        trafficSources[sources[si]] = Math.min(count, remainingVisitors);
        remainingVisitors -= trafficSources[sources[si]];
      }
    }

    const devices = ['desktop', 'mobile', 'tablet'];
    const deviceWeights = [0.55, 0.35, 0.10];
    remainingVisitors = visitors;
    const deviceMap = {};
    for (let di = 0; di < devices.length; di++) {
      if (di === devices.length - 1) {
        deviceMap[devices[di]] = remainingVisitors;
      } else {
        const count = Math.round(visitors * deviceWeights[di] * (0.85 + rng() * 0.3));
        deviceMap[devices[di]] = Math.min(count, remainingVisitors);
        remainingVisitors -= deviceMap[devices[di]];
      }
    }

    const browers = ['chrome', 'firefox', 'safari', 'edge', 'other'];
    const browserWeights = [0.50, 0.15, 0.18, 0.12, 0.05];
    remainingVisitors = visitors;
    const browserMap = {};
    for (let bi = 0; bi < browers.length; bi++) {
      if (bi === browers.length - 1) {
        browserMap[browers[bi]] = remainingVisitors;
      } else {
        const count = Math.round(visitors * browserWeights[bi] * (0.85 + rng() * 0.3));
        browserMap[browers[bi]] = Math.min(count, remainingVisitors);
        remainingVisitors -= browserMap[browers[bi]];
      }
    }

    const geoMap = {};
    const geoCounts = {};
    const countryCount = 3 + Math.floor(rng() * 5);
    let geoAssigned = 0;
    const shuffled = [...COUNTRIES].sort(() => rng() - 0.5);
    for (let gi = 0; gi < countryCount; gi++) {
      if (gi === countryCount - 1) {
        geoCounts[shuffled[gi]] = visitors - geoAssigned;
      } else {
        const count = Math.max(1, Math.round((visitors / countryCount) * (0.5 + rng())));
        geoCounts[shuffled[gi]] = count;
        geoAssigned += count;
      }
    }
    for (const [country, count] of Object.entries(geoCounts)) {
      if (count > 0) geoMap[country] = count;
    }

    const pageViewDetails = {};
    const pageWeights = { '/': 0.25, '/about': 0.15, '/projects': 0.25, '/skills': 0.20, '/contact': 0.10, '/testimonials': 0.05 };
    let remainingPV = pageViews;
    for (let pi = 0; pi < PAGES.length; pi++) {
      if (pi === PAGES.length - 1) {
        pageViewDetails[PAGES[pi]] = remainingPV;
      } else {
        const count = Math.round(pageViews * pageWeights[PAGES[pi]] * (0.8 + rng() * 0.4));
        pageViewDetails[PAGES[pi]] = Math.min(count, remainingPV);
        remainingPV -= pageViewDetails[PAGES[pi]];
      }
    }

    const interactions = Math.round(visitors * (0.5 + rng() * 1.5));
    const socialLinkClicks = Math.round(visitors * (0.05 + rng() * 0.15));
    const contactSubmissions = Math.round(visitors * (0.01 + rng() * 0.03));
    const testimonialConversions = Math.round(visitors * (0.02 + rng() * 0.05));

    batch.push({
      date,
      visitors,
      uniqueUsers,
      pageViews,
      pageViewDetails,
      interactions,
      trafficSources,
      devices: deviceMap,
      browsers: browserMap,
      geo: geoMap,
      socialLinkClicks,
      testimonialConversions,
      contactSubmissions,
      isSeedData: true,
    });

    if (batch.length >= 30) {
      await Analytics.insertMany(batch, { ordered: false });
      console.log(`${LS} Inserted ${batch.length} records (${((i + 1) / totalDays * 100).toFixed(0)}%)`);
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    await Analytics.insertMany(batch, { ordered: false });
    console.log(`${LS} Inserted final ${batch.length} records`);
  }

  const total = await Analytics.countDocuments({ isSeedData: true });
  console.log(`${LS} Done. Total seeded records: ${total}`);
  process.exit(0);
}

seedAnalytics().catch((err) => {
  console.error(`${LS} Seeding failed:`, err.message);
  process.exit(1);
});
