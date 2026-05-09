const SliderItem = require('../models/SliderItem');
const Media = require('../models/Media');

// @desc    Get all slider items
// @route   GET /api/slider
// @access  Public
const getSliderItems = async (req, res) => {
  try {
    const items = await SliderItem.find({ isActive: true })
      .populate('mediaId')
      .sort({ order: 1 })
      .exec();

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create slider item
// @route   POST /api/admin/slider
// @access  Private/Admin
const createSliderItem = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, mediaType, mediaId } = req.body;

    if (!title || !mediaId || !mediaType) {
      return res.status(400).json({ message: 'Please provide required fields: title, mediaId, mediaType' });
    }

    // Check if media exists
    const mediaExists = await Media.findById(mediaId);
    if (!mediaExists) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Get highest order number
    const lastItem = await SliderItem.findOne().sort({ order: -1 });
    const order = lastItem ? lastItem.order + 1 : 0;

    const sliderItem = await SliderItem.create({
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      mediaType,
      mediaId,
      order,
      isActive: true
    });

    const populatedItem = await sliderItem.populate('mediaId');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update slider item
// @route   PUT /api/admin/slider/:id
// @access  Private/Admin
const updateSliderItem = async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, order } = req.body;

    const sliderItem = await SliderItem.findById(req.params.id);

    if (!sliderItem) {
      return res.status(404).json({ message: 'Slider item not found' });
    }

    // Check if media exists if provided
    if (mediaId && mediaId !== sliderItem.mediaId.toString()) {
      const mediaExists = await Media.findById(mediaId);
      if (!mediaExists) {
        return res.status(404).json({ message: 'Media not found' });
      }
    }

    // Update fields
    if (title) sliderItem.title = title;
    if (subtitle !== undefined) sliderItem.subtitle = subtitle;
    if (description !== undefined) sliderItem.description = description;
    if (buttonText) sliderItem.buttonText = buttonText;
    if (buttonLink !== undefined) sliderItem.buttonLink = buttonLink;
    if (mediaType) sliderItem.mediaType = mediaType;
    if (mediaId) sliderItem.mediaId = mediaId;
    if (order !== undefined) sliderItem.order = order;

    await sliderItem.save();

    const populatedItem = await sliderItem.populate('mediaId');
    res.status(200).json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete slider item
// @route   DELETE /api/admin/slider/:id
// @access  Private/Admin
const deleteSliderItem = async (req, res) => {
  try {
    const sliderItem = await SliderItem.findById(req.params.id);

    if (!sliderItem) {
      return res.status(404).json({ message: 'Slider item not found' });
    }

    await sliderItem.deleteOne();
    res.status(200).json({ message: 'Slider item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder slider items
// @route   PUT /api/admin/slider/reorder
// @access  Private/Admin
const reorderSliderItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Please provide items array' });
    }

    // Update order for each item
    for (let i = 0; i < items.length; i++) {
      await SliderItem.findByIdAndUpdate(items[i]._id, { order: i });
    }

    const reorderedItems = await SliderItem.find({ isActive: true })
      .populate('mediaId')
      .sort({ order: 1 });

    res.status(200).json(reorderedItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSliderItems,
  createSliderItem,
  updateSliderItem,
  deleteSliderItem,
  reorderSliderItems
};
