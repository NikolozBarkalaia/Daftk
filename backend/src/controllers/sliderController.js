const SliderItem = require('../models/SliderItem');
const Media = require('../models/Media');

const getSliderItems = (req, res) => {
  try {
    const items = SliderItem.findAll({ isActive: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSliderItem = (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, mediaType, mediaId } = req.body;
    if (!title || !mediaId || !mediaType) {
      return res.status(400).json({ message: 'Please provide required fields: title, mediaId, mediaType' });
    }
    const mediaExists = Media.findById(mediaId);
    if (!mediaExists) return res.status(404).json({ message: 'Media not found' });
    const order = SliderItem.findMaxOrder() + 1;
    const sliderItem = SliderItem.create({ title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, order, isActive: true });
    res.status(201).json(sliderItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSliderItem = (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, order } = req.body;
    const sliderItem = SliderItem.findById(req.params.id);
    if (!sliderItem) return res.status(404).json({ message: 'Slider item not found' });
    if (mediaId && mediaId !== sliderItem.mediaId) {
      const mediaExists = Media.findById(mediaId);
      if (!mediaExists) return res.status(404).json({ message: 'Media not found' });
    }
    const updated = SliderItem.update(req.params.id, { title, subtitle, description, buttonText, buttonLink, mediaType, mediaId, order });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSliderItem = (req, res) => {
  try {
    const sliderItem = SliderItem.findById(req.params.id);
    if (!sliderItem) return res.status(404).json({ message: 'Slider item not found' });
    SliderItem.delete(req.params.id);
    res.status(200).json({ message: 'Slider item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderSliderItems = (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Please provide items array' });
    for (let i = 0; i < items.length; i++) {
      SliderItem.updateOrder(items[i]._id || items[i].id, i);
    }
    res.status(200).json(SliderItem.findAll({ isActive: true }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSliderItems, createSliderItem, updateSliderItem, deleteSliderItem, reorderSliderItems };
