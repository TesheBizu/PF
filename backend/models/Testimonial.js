const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Reviewer role is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    message: {
      type: String,
      required: [true, 'Testimonial message is required'],
    },
    published: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
