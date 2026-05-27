const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrderByToken,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  requestOrderLookup,
  verifyOrderLookup,
} = require('../controllers/orderController');

// IP-based rate limit: max 10 OTP requests per IP per 15 minutes
// Blocks scripted abuse from a single device targeting many phone numbers
const otpIpLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this device. Please try again in 15 minutes.' },
});

// Admin only (must be before /:id wildcard)
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

// Public
router.post('/', createOrder);
router.post('/request-lookup', otpIpLimit, requestOrderLookup);
router.post('/verify-lookup', verifyOrderLookup);
router.get('/t/:token', getOrderByToken);
router.get('/:id', getOrderById);

module.exports = router;
