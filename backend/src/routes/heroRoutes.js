const express = require('express');
const router = express.Router();
const { getHero, updateHero } = require('../controllers/heroController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getHero);

// Admin routes
router.put('/', protect, admin, updateHero);

module.exports = router;
