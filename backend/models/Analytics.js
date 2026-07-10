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
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
