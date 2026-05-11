const express = require('express');
const router = express.Router();
const { submitMessage, getMessages } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(submitMessage)
  .get(protect, admin, getMessages);

module.exports = router;
