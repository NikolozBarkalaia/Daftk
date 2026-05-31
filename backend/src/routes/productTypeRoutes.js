const express = require('express');
const router = express.Router();
const {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} = require('../controllers/productTypeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProductTypes);
router.post('/', protect, admin, createProductType);
router.put('/:id', protect, admin, updateProductType);
router.delete('/:id', protect, admin, deleteProductType);

module.exports = router;
