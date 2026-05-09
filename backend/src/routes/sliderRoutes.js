const express = require('express');
const router = express.Router();
const {
  getSliderItems,
  createSliderItem,
  updateSliderItem,
  deleteSliderItem,
  reorderSliderItems
} = require('../controllers/sliderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSliderItems);

// Admin routes - specific routes first
router.put('/reorder', protect, admin, reorderSliderItems);
router.post('/', protect, admin, createSliderItem);
router.put('/:id', protect, admin, updateSliderItem);
router.delete('/:id', protect, admin, deleteSliderItem);

module.exports = router;
