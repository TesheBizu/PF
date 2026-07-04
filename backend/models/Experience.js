const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Please add a job role or academic title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company or institution name'],
      trim: true,
    },
    period: {
      type: String,
      required: [true, 'Please add a duration period (e.g. 2024 - Present)'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location (e.g. Bahir Dar, Ethiopia)'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add description details'],
    },
    iconUrl: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['work', 'education', 'learning'],
      default: 'work',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
