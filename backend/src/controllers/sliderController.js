const SliderItem = require('../models/SliderItem');
const Media = require('../models/Media');

const getSliderItems = async (req, res) => {
  try {
    const items = await SliderItem.findAll({ isActive: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSliderItem = async (req, res) => {
  try {
    const { title, subtitle, mediaType, mediaId } = req.body;
    if (!title || !mediaId || !mediaType) {
      return res.status(400).json({ message: 'Please provide required fields: title, mediaId, mediaType' });
    }
    const mediaExists = await Media.findById(mediaId);
    if (!mediaExists) return res.status(404).json({ message: 'Media not found' });
    const order = (await SliderItem.findMaxOrder()) + 1;
    const sliderItem = await SliderItem.create({ title, subtitle, mediaType, mediaId, order, isActive: true });
    res.status(201).json(sliderItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSliderItem = async (req, res) => {
  try {
    const { title, subtitle, mediaType, mediaId, order } = req.body;
    const sliderItem = await SliderItem.findById(req.params.id);
    if (!sliderItem) return res.status(404).json({ message: 'Slider item not found' });
    if (mediaId && mediaId !== sliderItem.mediaId) {
      const mediaExists = await Media.findById(mediaId);
      if (!mediaExists) return res.status(404).json({ message: 'Media not found' });
    }
    const updated = await SliderItem.update(req.params.id, { title, subtitle, mediaType, mediaId, order });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSliderItem = async (req, res) => {
  try {
    const sliderItem = await SliderItem.findById(req.params.id);
    if (!sliderItem) return res.status(404).json({ message: 'Slider item not found' });
    await SliderItem.delete(req.params.id);
    res.status(200).json({ message: 'Slider item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderSliderItems = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Please provide items array' });
    for (let i = 0; i < items.length; i++) {
      await SliderItem.updateOrder(items[i]._id || items[i].id, i);
    }
    res.status(200).json(await SliderItem.findAll({ isActive: true }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSliderItems, createSliderItem, updateSliderItem, deleteSliderItem, reorderSliderItems };

