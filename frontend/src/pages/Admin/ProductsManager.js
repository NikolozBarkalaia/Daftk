import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
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
    imageUrls: []
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
      setMessage('Error loading products');
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
      imageUrls: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

      setMessage('Image(s) uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error uploading image');
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
        setMessage('Please fill in all required fields');
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
        imageUrls: formData.imageUrls
      };

      if (editingId) {
        // Update
        const response = await api.put(`/products/${editingId}`, submitData);
        setProducts(products.map(p => p._id === editingId ? response.data : p));
        setMessage('Product updated successfully!');
      } else {
        // Create
        const response = await api.post('/products', submitData);
        setProducts([...products, response.data]);
        setMessage('Product created successfully!');
      }

      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage(error.response?.data?.message || 'Error saving product');
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
      imageUrls: product.imageUrls
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        setMessage('Product deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting product:', error);
        setMessage('Error deleting product');
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

      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

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
                <label className="block text-sm font-medium mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
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
                        src={`http://localhost:5000${url}`}
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
                    src={`http://localhost:5000${product.imageUrls[0]}`}
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
