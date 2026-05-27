const Order = require('../models/Order');
const SmsVerification = require('../models/SmsVerification');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { sendOtpSms, normalizePhone } = require('../services/smsService');

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
  if (!shippingAddress.phone || String(shippingAddress.phone).replace(/\D/g, '').length < 9) {
    return res.status(400).json({ message: 'Phone number is required' });
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

    if (shippingAddress.email) {
      sendOrderConfirmationEmail(shippingAddress.email, order).catch(() => { });
    }

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

// @desc    Send OTP via SMS for order lookup by phone
// @route   POST /api/orders/request-lookup
// @access  Public
const requestOrderLookup = async (req, res) => {
  const { phone } = req.body;
  if (!phone || String(phone).replace(/\D/g, '').length < 9) {
    return res.status(400).json({ message: 'Valid phone number is required' });
  }

  const normalized = normalizePhone(phone);

  try {
    // Check orders exist before sending OTP — avoids sending SMS to unknown numbers
    const existingOrders = await Order.findByPhone(normalized);
    if (!existingOrders.length) {
      return res.status(404).json({ message: 'No orders found for this phone number.' });
    }

    const withinLimit = await SmsVerification.checkRateLimit(normalized);
    if (!withinLimit) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    // Check per-phone resend cooldown from previous wrong attempts
    const cooldown = await SmsVerification.checkResendCooldown(normalized);
    if (cooldown.blocked) {
      return res.status(429).json({
        message: `Too many wrong attempts. Please wait ${cooldown.secondsLeft} seconds before requesting a new code.`,
        secondsLeft: cooldown.secondsLeft,
      });
    }

    const code = await SmsVerification.create(normalized);
    console.log('[OTP] Code created for', normalized, '— sending SMS…');

    try {
      await sendOtpSms(normalized, code);
    } catch (smsErr) {
      console.error('[OTP] SMS send failed:', smsErr.message);
      return res.status(502).json({ message: `SMS delivery failed: ${smsErr.message}` });
    }

    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('[requestOrderLookup]', err);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
};

// @desc    Verify SMS OTP and return orders for that phone
// @route   POST /api/orders/verify-lookup
// @access  Public
const verifyOrderLookup = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone number and code are required' });
  }

  const normalized = normalizePhone(phone);

  try {
    const result = await SmsVerification.verify(normalized, String(code).trim());

    if (!result.valid) {
      if (result.reason === 'max_attempts') {
        return res.status(401).json({
          message: 'Too many failed attempts. Please request a new code.',
        });
      }
      const attemptsMsg =
        result.attemptsLeft != null
          ? ` ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? '' : 's'} remaining.`
          : '';
      return res.status(401).json({
        message: `Invalid or expired code.${attemptsMsg}`,
      });
    }

    const orders = await Order.findByPhone(normalized);
    res.json(orders);
  } catch (err) {
    console.error('[verifyOrderLookup]', err);
    res.status(500).json({ message: 'Verification failed' });
  }
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
