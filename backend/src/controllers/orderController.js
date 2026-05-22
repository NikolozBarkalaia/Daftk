const Order = require('../models/Order');
const { sendOrderConfirmationEmail, sendOrderLookupEmail } = require('../services/emailService');

// In-memory OTP store { email -> { code, expiresAt } }
const otpStore = new Map();

// @desc    Create new order (guest – no auth required)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  const { items, shippingAddress, subtotal, total, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }
  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }
  if (!shippingAddress.email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const order = await Order.create({
      userId: null, // guest orders have no user account
      items,
      shippingAddress,
      subtotal: Number(subtotal) || 0,
      total: Number(total) || Number(subtotal) || 0,
      notes,
    });

    sendOrderConfirmationEmail(shippingAddress.email, order).catch(() => { });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// @desc    Get order by token (public, unguessable)
// @route   GET /api/orders/t/:token
// @access  Public
const getOrderByToken = async (req, res) => {
  try {
    const order = await Order.findByToken(req.params.token);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// @desc    Get order by ID (admin use)
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const updated = await Order.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// @desc    Send OTP to email for order lookup
// @route   POST /api/orders/request-lookup
// @access  Public
const requestOrderLookup = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + 10 * 60 * 1000 });

  await sendOrderLookupEmail(email, code).catch(() => { });

  res.json({ message: 'Verification code sent' });
};

// @desc    Verify OTP and return orders for that email
// @route   POST /api/orders/verify-lookup
// @access  Public
const verifyOrderLookup = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const stored = otpStore.get(email.toLowerCase());
  if (!stored || stored.code !== String(code) || Date.now() > stored.expiresAt) {
    return res.status(401).json({ message: 'Invalid or expired code' });
  }

  otpStore.delete(email.toLowerCase());
  const orders = await Order.findByEmail(email);
  res.json(orders);
};

module.exports = {
  createOrder,
  getOrderByToken,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  requestOrderLookup,
  verifyOrderLookup,
};
