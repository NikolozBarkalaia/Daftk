const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  addProductImage,
  removeProductImage,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes - specific routes first
router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes - most specific paths first
router.post('/', protect, admin, createProduct);
router.delete('/:id/images/:imageIndex', protect, admin, removeProductImage);
router.put('/:id/images', protect, admin, addProductImage);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
