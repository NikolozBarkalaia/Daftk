const Settings = require('../models/Settings');

// @desc    Get all site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const settingsObj = req.body;
    if (!settingsObj || typeof settingsObj !== 'object') {
      return res.status(400).json({ message: 'Invalid settings data' });
    }
    await Settings.upsert(settingsObj);
    const updatedSettings = await Settings.getAll();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
