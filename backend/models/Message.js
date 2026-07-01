const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    replyText: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
