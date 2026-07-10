const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['message', 'project', 'skill', 'experience', 'testimonial', 'system', 'alert'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
