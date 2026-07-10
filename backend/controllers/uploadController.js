const cloudinary = require('../config/cloudinary');

// @desc    Upload file (image/PDF) to Cloudinary
// @route   POST /api/upload
// @access  Private (Admin)
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const folderMap = { cv: 'portfolio_cvs', project: 'portfolio_projects', profile: 'portfolio_profile' };
    const folder = folderMap[req.body.type] || 'portfolio_projects';

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64, { folder });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file to Cloudinary',
      error: error.message || error,
      details: typeof error === 'object' ? JSON.stringify(error) : error,
    });
  }
};

module.exports = { uploadImage };
