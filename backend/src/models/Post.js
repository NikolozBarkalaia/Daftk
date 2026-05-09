const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  image: {
    type: String, // URL of the uploaded image
    default: ''
  },
  tags: {
    type: [String], // Array of strings for tags
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
