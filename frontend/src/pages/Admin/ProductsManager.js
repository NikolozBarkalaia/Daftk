import React, { useEffect, useState } from 'react';
import api, { getMediaUrl } from '../../services/api';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

/* ─── Luxury Badge Presets ─────────────────────────────────────── */
const BADGE_PRESETS = [
  { name: 'Exclusive Gold', bg: '#C8A96B', text: '#FFFFFF' },
  { name: 'Champagne Beige', bg: '#E7D7BE', text: '#1A1A1A' },
  { name: 'Matte Black Luxury', bg: '#111111', text: '#F5E7D0' },
  { name: 'Warm Nude', bg: '#D6B79A', text: '#FFFFFF' },
  { name: 'Ivory Minimal', bg: '#F5EFE6', text: '#2B2B2B' },
  { name: 'Premium Black & Gold', bg: '#0F0F0F', text: '#C6A972', border: '#C6A972' },
  { name: 'Soft Sand', bg: '#D9C2A0', text: '#1C1C1C' },
  { name: 'Rich Bronze', bg: '#8C6A43', text: '#FFFFFF' },
  { name: 'Cream Luxury', bg: '#EFE3D3', text: '#222222' },
  { name: 'Dark Espresso', bg: '#2A1F1B', text: '#F3D9B1' },
];

const BADGE_TEXT_SUGGESTIONS = ['NEW', 'LIMITED', 'EXCLUSIVE', 'PREMIUM', 'SIGNATURE', "EDITOR'S PICK", 'CURATED', 'BESTSELLER', 'ARCHIVE', 'SELECTED'];

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, confirm } = useNotification();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    tags: '',
    stock: '',
    isFeatured: false,
    luxuryLabel: '',
    imageUrls: [],
    hasBadge: false,
    badgeText: '',
    badgeBgColor: '#000000',
    badgeTextColor: '#ffffff',
    sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?limit=100');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      oldPrice: '',
      category: '',
      tags: '',
      stock: '',
      isFeatured: false,
      luxuryLabel: '',
      imageUrls: [],
      hasBadge: false,
      badgeText: '',
      badgeBgColor: '#000000',
      badgeTextColor: '#ffffff',
      sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('sizeStock_')) {
      const size = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        sizeStock: {
          ...prev.sizeStock,
          [size]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    try {
      setUploadingImage(true);
      const formDataMultipart = new FormData();

      for (let file of files) {
        formDataMultipart.append('file', file);

        const uploadRes = await api.post('/media/upload', formDataMultipart);
        const mediaUrl = uploadRes.data.url;

        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, mediaUrl]
        }));
      }

      showSuccess('Image(s) uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
        showError('Please fill in all required fields');
        return;
      }

      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        stock: parseInt(formData.stock),
        isFeatured: formData.isFeatured,
        luxuryLabel: formData.luxuryLabel || null,
        imageUrls: formData.imageUrls,
        hasBadge: formData.hasBadge,
        badgeText: formData.hasBadge ? formData.badgeText : null,
        badgeBgColor: formData.hasBadge ? formData.badgeBgColor : '#000000',
        badgeTextColor: formData.hasBadge ? formData.badgeTextColor : '#ffffff',
        sizeStock: formData.sizeStock,
      };

      if (editingId) {
        // Update
        const response = await api.put(`/products/${editingId}`, submitData);
        setProducts(products.map(p => p._id === editingId ? response.data : p));
        showSuccess('Product updated successfully!');
      } else {
        // Create
        const response = await api.post('/products', submitData);
        setProducts([...products, response.data]);
        showSuccess('Product created successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showError(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      category: product.category,
      tags: product.tags.join(', '),
      stock: product.stock.toString(),
      isFeatured: product.isFeatured,
      luxuryLabel: product.luxuryLabel || '',
      imageUrls: product.imageUrls,
      hasBadge: product.hasBadge || false,
      badgeText: product.badgeText || '',
      badgeBgColor: product.badgeBgColor || '#000000',
      badgeTextColor: product.badgeTextColor || '#ffffff',
      sizeStock: product.sizeStock || { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });

    if (isConfirmed) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        showSuccess('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('Error deleting product');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Products Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn flex items-center gap-2"
          >
            <Plus size={20} /> Add Product
          </button>
        )}
      </div>



      {/* Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-lg border border-border shadow-sm mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">{editingId ? 'Edit' : 'Add'} Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Old Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  readOnly
                  placeholder="Sum of sizes"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium mb-4">Size Inventory Management</label>
              <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded border border-border">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <div key={size}>
                    <label className="block text-xs font-semibold mb-1 text-center">{size}</label>
                    <input
                      type="number"
                      name={`sizeStock_${size}`}
                      value={formData.sizeStock[size] || 0}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Also update total stock
                        const newSizeStock = { ...formData.sizeStock, [size]: parseInt(e.target.value) || 0 };
                        const total = Object.values(newSizeStock).reduce((a, b) => a + b, 0);
                        setFormData(prev => ({ ...prev, stock: total.toString() }));
                      }}
                      className="input-field text-center"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. luxury, new, exclusive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Luxury Label</label>
                <select
                  name="luxuryLabel"
                  value={formData.luxuryLabel}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="exclusive">Exclusive</option>
                  <option value="limited">Limited</option>
                  <option value="bestseller">Bestseller</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium">Mark as Featured</label>
            </div>

            {/* Badge Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="hasBadge"
                  id="hasBadge"
                  checked={formData.hasBadge}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label htmlFor="hasBadge" className="text-sm font-medium">Add Badge</label>
              </div>

              {formData.hasBadge && (
                <div className="space-y-4 bg-gray-50 p-4 rounded">
                  {/* Badge Text with Quick Suggestions */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Badge Text</label>
                    <input
                      type="text"
                      name="badgeText"
                      value={formData.badgeText}
                      onChange={handleInputChange}
                      className="input-field mb-2"
                      placeholder="e.g. NEW, SALE, LIMITED, EXCLUSIVE"
                      maxLength="15"
                    />
                    <div className="flex flex-wrap gap-2">
                      {BADGE_TEXT_SUGGESTIONS.map(text => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, badgeText: text }))}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            formData.badgeText === text
                              ? 'bg-blue-100 border-blue-400 text-blue-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Luxury Color Presets */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Luxury Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BADGE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            badgeBgColor: preset.bg,
                            badgeTextColor: preset.text,
                          }))}
                          className={`p-3 rounded border-2 transition-all text-left ${
                            formData.badgeBgColor === preset.bg && formData.badgeTextColor === preset.text
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-700 mb-2">{preset.name}</div>
                          <div
                            style={{
                              backgroundColor: preset.bg,
                              color: preset.text,
                              border: preset.border ? `2px solid ${preset.border}` : 'none',
                            }}
                            className="px-2 py-1 rounded text-xs font-semibold text-center"
                          >
                            Preview
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Colors</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-dark mb-1">Background</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="badgeBgColor"
                            value={formData.badgeBgColor}
                            onChange={handleInputChange}
                            className="w-12 h-10 rounded cursor-pointer border border-border"
                          />
                          <input
                            type="text"
                            name="badgeBgColor"
                            value={formData.badgeBgColor}
                            onChange={handleInputChange}
                            className="input-field flex-1 text-xs"
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-dark mb-1">Text Color</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="badgeTextColor"
                            value={formData.badgeTextColor}
                            onChange={handleInputChange}
                            className="w-12 h-10 rounded cursor-pointer border border-border"
                          />
                          <input
                            type="text"
                            name="badgeTextColor"
                            value={formData.badgeTextColor}
                            onChange={handleInputChange}
                            className="input-field flex-1 text-xs"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge Preview */}
                  <div className="bg-white p-3 rounded border border-border">
                    <p className="text-xs text-gray-dark mb-2">Live Preview:</p>
                    <div
                      style={{
                        backgroundColor: formData.badgeBgColor,
                        color: formData.badgeTextColor,
                      }}
                      className="inline-block px-3 py-1 rounded text-sm font-semibold uppercase"
                    >
                      {formData.badgeText || 'Badge'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <div className="border-2 border-dashed border-border rounded p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer flex items-center justify-center gap-2">
                  <Upload size={20} />
                  {uploadingImage ? 'Uploading...' : 'Click to upload images or drag and drop'}
                </label>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getMediaUrl(url)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-40 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn flex-1">
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-center text-gray-dark py-8">No products yet. Create one to get started!</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="bg-white p-6 rounded-lg border border-border shadow-sm">
              <div className="flex items-start gap-4">
                {product.imageUrls && product.imageUrls.length > 0 && (
                  <img
                    src={getMediaUrl(product.imageUrls[0])}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold">{product.name}</h3>
                    {product.luxuryLabel && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded capitalize">
                        {product.luxuryLabel}
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Featured</span>
                    )}
                  </div>
                  <p className="text-gray-dark mb-2">{product.description.substring(0, 100)}...</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span><strong>Price:</strong> €{product.price}</span>
                    {product.oldPrice && <span><strong>Old Price:</strong> €{product.oldPrice}</span>}
                    <span><strong>Stock:</strong> {product.stock}</span>
                    <span><strong>Category:</strong> {product.category}</span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 flex-wrap">
                        {product.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-light px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 hover:bg-gray-light rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
