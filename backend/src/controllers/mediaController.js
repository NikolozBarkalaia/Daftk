const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');

// @desc    Upload new media file
// @route   POST /api/media/upload
// @access  Private/Admin
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const isVideo = req.file.mimetype.startsWith('video');
    const media = await Media.create({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      type: isVideo ? 'video' : 'image',
      size: req.file.size,
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all media files
// @route   GET /api/media
// @access  Private/Admin
const getMediaFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      Media.find({ skip, limit }),
      Media.countDocuments(),
    ]);

    res.status(200).json({
      media,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private/Admin
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.delete(req.params.id);
    res.status(200).json({ message: 'Media removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMedia,
  getMediaFiles,
  deleteMedia,
};

};

