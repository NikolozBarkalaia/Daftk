const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/verify/:token', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (!decoded.email) throw new Error('Invalid token payload');

    User.markVerified(decoded.email);
    console.log('✅ Email verified:', decoded.email);
    return res.redirect(`${frontendUrl}/?verified=1`);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    return res.redirect(`${frontendUrl}/?verified=0`);
  }
});

module.exports = router;