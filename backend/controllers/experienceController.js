const Experience = require('../models/Experience');

// @desc    Get all experiences (public)
// @route   GET /api/experiences
// @access  Public
const getExperiences = async (req, res, next) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new experience entry
// @route   POST /api/experiences
// @access  Private (Admin)
const createExperience = async (req, res, next) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an experience entry
// @route   PUT /api/experiences/:id
// @access  Private (Admin)
const updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience entry not found' });
    }

    res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single experience entry
// @route   GET /api/experiences/:id
// @access  Public
const getExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience entry not found' });
    }
    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an experience entry
// @route   DELETE /api/experiences/:id
// @access  Private (Admin)
const deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience entry not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
};
