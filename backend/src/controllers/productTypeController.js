const ProductType = require('../models/ProductType');

// @desc    Get all product types (public)
// @route   GET /api/product-types
// @access  Public
const getProductTypes = async (req, res) => {
  try {
    const types = await ProductType.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product type
// @route   POST /api/product-types
// @access  Private/Admin
const createProductType = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const { displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a type name' });
    }

    const existing = await ProductType.findByName(name);
    if (existing) {
      return res.status(400).json({ message: 'This product type already exists' });
    }

    const type = await ProductType.create({ name, displayOrder });
    res.status(201).json(type);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product type
// @route   PUT /api/product-types/:id
// @access  Private/Admin
const updateProductType = async (req, res) => {
  try {
    const type = await ProductType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    const fields = {};
    if (req.body.name !== undefined) fields.name = req.body.name.trim();
    if (req.body.displayOrder !== undefined) fields.displayOrder = req.body.displayOrder;

    if (fields.name) {
      const existing = await ProductType.findByName(fields.name);
      if (existing && existing._id !== type._id) {
        return res.status(400).json({ message: 'This product type already exists' });
      }
    }

    const updated = await ProductType.update(req.params.id, fields);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product type
// @route   DELETE /api/product-types/:id
// @access  Private/Admin
const deleteProductType = async (req, res) => {
  try {
    const type = await ProductType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Product type not found' });
    }
    await ProductType.delete(req.params.id);
    res.status(200).json({ message: 'Product type removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
};
