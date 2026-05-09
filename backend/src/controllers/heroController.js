const Hero = require('../models/Hero');
const Media = require('../models/Media');

// @desc    Get hero content
// @route   GET /api/hero
// @access  Public
const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne({ isActive: true }).populate('mediaId');

    if (!hero) {
      // Return default hero if none exists
      hero = {
        title: 'Redefining Luxury',
        subtitle: 'Discover the essentials of modern minimalism.',
        buttonText: 'Explore Collection',
        buttonLink: '/shop',
        mediaType: 'video',
        mediaId: null
      };
    }

    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update hero content
// @route   POST /api/admin/hero
// @access  Private/Admin
const updateHero = async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, mediaType, mediaId } = req.body;

    if (!title || !subtitle || !buttonText || !buttonLink || !mediaType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if media exists if provided
    if (mediaId) {
      const mediaExists = await Media.findById(mediaId);
      if (!mediaExists) {
        return res.status(404).json({ message: 'Media not found' });
      }
    }

    let hero = await Hero.findOne({ isActive: true });

    if (hero) {
      // Update existing
      hero.title = title;
      hero.subtitle = subtitle;
      hero.buttonText = buttonText;
      hero.buttonLink = buttonLink;
      hero.mediaType = mediaType;
      hero.mediaId = mediaId || hero.mediaId;
      await hero.save();
    } else {
      // Create new
      hero = await Hero.create({
        title,
        subtitle,
        buttonText,
        buttonLink,
        mediaType,
        mediaId,
        isActive: true
      });
    }

    const populatedHero = await hero.populate('mediaId');
    res.status(200).json(populatedHero);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getHero,
  updateHero
};
