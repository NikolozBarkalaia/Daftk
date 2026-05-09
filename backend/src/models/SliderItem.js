const mongoose = require('mongoose');

const sliderItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  subtitle: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  buttonText: {
    type: String,
    default: 'Discover'
  },
  buttonLink: {
    type: String,
    required: false
  },
  mediaType: {
    type: String,
    enum: ['video', 'image'],
    required: true,
    default: 'image'
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SliderItem = mongoose.model('SliderItem', sliderItemSchema);
module.exports = SliderItem;
