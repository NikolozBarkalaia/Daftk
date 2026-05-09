const express = require('express');
const router = express.Router();
const { uploadMedia, getMediaFiles, deleteMedia } = require('../controllers/mediaController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public - get all media
router.route('/')
  .get(getMediaFiles);

// Admin only
router.post('/upload', protect, admin, upload.single('file'), uploadMedia);

router.route('/:id')
  .delete(protect, admin, deleteMedia);

module.exports = router;
