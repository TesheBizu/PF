const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  visitors: {
    type: Number,
    default: 0,
  },
  uniqueUsers: {
    type: Number,
    default: 0,
  },
  pageViews: {
    type: Number,
    default: 0,
  },
  pageViewDetails: {
    type: Map,
    of: Number,
    default: {},
  },
  interactions: {
    type: Number,
    default: 0,
  },
  trafficSources: {
    type: Map,
    of: Number,
    default: { direct: 0, organic: 0, social: 0, referral: 0, email: 0 },
  },
  devices: {
    type: Map,
    of: Number,
    default: { desktop: 0, mobile: 0, tablet: 0 },
  },
  browsers: {
    type: Map,
    of: Number,
    default: { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 },
  },
  geo: {
    type: Map,
    of: Number,
    default: {},
  },
  socialLinkClicks: {
    type: Number,
    default: 0,
  },
  testimonialConversions: {
    type: Number,
    default: 0,
  },
  contactSubmissions: {
    type: Number,
    default: 0,
  },
  isSeedData: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
