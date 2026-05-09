const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0
  },
  oldPrice: {
    type: Number,
    required: false,
    default: null
  },
  imageUrls: {
    type: [String],
    required: false,
    default: []
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  tags: {
    type: [String],
    required: false,
    default: []
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  luxuryLabel: {
    type: String,
    required: false,
    enum: ['new', 'exclusive', 'limited', 'bestseller', null],
    default: null
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
