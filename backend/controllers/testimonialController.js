const Testimonial = require('../models/Testimonial');
const { getIO } = require('../socket');

const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

const getPublishedTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

const getTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    getIO().emit('testimonial:created', testimonial.toObject());
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    getIO().emit('testimonial:updated', testimonial.toObject());
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    getIO().emit('testimonial:deleted', testimonial._id.toString());
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestimonials,
  getPublishedTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
