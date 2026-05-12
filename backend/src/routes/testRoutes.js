const express = require("express");
const router = express.Router();

const { sendTestEmail } = require("../services/emailService");

router.get("/test-email", async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;