const express = require('express');
const router = express.Router();
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

// Admin only (must be before /:id wildcard)
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

// Public
router.post('/', createOrder);
router.post('/request-lookup', requestOrderLookup);
router.post('/verify-lookup', verifyOrderLookup);
router.get('/t/:token', getOrderByToken);  // unguessable token-based lookup
router.get('/:id', getOrderById);

module.exports = router;
