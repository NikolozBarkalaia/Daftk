const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    default: 'Redefining Luxury'
  },
  subtitle: {
    type: String,
    required: [true, 'Please add a subtitle'],
    default: 'Discover the essentials of modern minimalism.'
  },
  buttonText: {
    type: String,
    required: [true, 'Please add button text'],
    default: 'Explore Collection'
  },
  buttonLink: {
    type: String,
    required: [true, 'Please add button link'],
    default: '/shop'
  },
  mediaType: {
    type: String,
    enum: ['video', 'image'],
    required: [true, 'Please select media type'],
    default: 'video'
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Hero = mongoose.model('Hero', heroSchema);
module.exports = Hero;
