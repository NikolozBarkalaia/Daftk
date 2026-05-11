const Product = require('../models/Product');

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const query = category ? { category } : {};
    const products = Product.find(query, { skip, limit });
    const total = Product.countDocuments(query);

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID (public)
// @route   GET /api/products/:id
// @access  Public
const getProductById = (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products (public)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = Product.findFeatured(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = (req, res) => {
  try {
    const { name, description, price, oldPrice, category, tags, stock, isFeatured, luxuryLabel, imageUrls, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Please provide required fields' });
    }

    const product = Product.create({
      name, description, price, oldPrice, category, tags, stock, isFeatured, luxuryLabel, imageUrls, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => {
  try {
    const { name, description, price, oldPrice, category, tags, stock, isFeatured, luxuryLabel, imageUrls, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock } = req.body;

    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = Product.update(req.params.id, {
      name, description, price, oldPrice, category, tags, stock, isFeatured, luxuryLabel, imageUrls, hasBadge, badgeText, badgeBgColor, badgeTextColor, sizeStock,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add image URL to product
// @route   PUT /api/admin/products/:id/images
// @access  Private/Admin
const addProductImage = (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Please provide image URL' });
    }

    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newUrls = [...product.imageUrls, imageUrl];
    const updated = Product.update(req.params.id, { imageUrls: newUrls });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove image URL from product
// @route   DELETE /api/admin/products/:id/images/:imageIndex
// @access  Private/Admin
const removeProductImage = (req, res) => {
  try {
    const imageIndex = parseInt(req.params.imageIndex);

    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (imageIndex < 0 || imageIndex >= product.imageUrls.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    const newUrls = [...product.imageUrls];
    newUrls.splice(imageIndex, 1);
    const updated = Product.update(req.params.id, { imageUrls: newUrls });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    Product.delete(req.params.id);
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  addProductImage,
  removeProductImage,
  deleteProduct,
};

