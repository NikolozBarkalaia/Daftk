const Hero = require('../models/Hero');
const Media = require('../models/Media');

// @desc    Get hero content
// @route   GET /api/hero
// @access  Public
const getHero = (req, res) => {
  try {
    const hero = Hero.findActive();

    if (!hero) {
      return res.status(200).json({
        title: 'Redefining Luxury',
        subtitle: 'Discover the essentials of modern minimalism.',
        buttonText: 'Explore Collection',
        buttonLink: '/shop',
        mediaType: 'video',
        mediaId: null,
      });
    }

    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update hero content
// @route   POST /api/admin/hero
// @access  Private/Admin
const updateHero = (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, mediaType, mediaId } = req.body;

    if (!title || !subtitle || !buttonText || !buttonLink || !mediaType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (mediaId) {
      const mediaExists = Media.findById(mediaId);
      if (!mediaExists) {
        return res.status(404).json({ message: 'Media not found' });
      }
    }

    const existing = Hero.findActive();

    if (existing) {
      const updated = Hero.update(existing.id, { title, subtitle, buttonText, buttonLink, mediaType, mediaId: mediaId || existing.id });
      return res.status(200).json(updated);
    }

    const hero = Hero.create({ title, subtitle, buttonText, buttonLink, mediaType, mediaId, isActive: true });
    res.status(200).json(hero);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getHero,
  updateHero,
};

