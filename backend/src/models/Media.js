const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
