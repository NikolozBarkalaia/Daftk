import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProductAndRelated();
  }, [id]);

  const fetchProductAndRelated = async () => {
    try {
      setLoading(true);
      const [productRes, allProductsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/products?limit=100')
      ]);

      setProduct(productRes.data);

      // Find related products from same category
      const related = allProductsRes.data.products
        .filter(p => p._id !== id && p.category === productRes.data.category)
        .slice(0, 4);

      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching product', error);
      setMessage('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Check if product already in cart
      const existingItem = cart.find(item => item._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.imageUrls?.[0] || '',
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      setMessage('Added to cart successfully!');
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Error adding to cart');
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading...</div>;

  if (!product) {
    return <div className="container py-20 text-center text-gray-dark">{message || 'Product not found'}</div>;
  }

  const mainImage = product.imageUrls?.[selectedImageIndex];
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;

  return (
    <div className="container pb-20">
      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="product-details-container">
        {/* Image Gallery */}
        <div>
          <div 
            className="product-details-image mb-4"
            style={{
              backgroundImage: mainImage 
                ? `url(${getMediaUrl(mainImage)})`
                : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {product.luxuryLabel && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 text-sm font-semibold uppercase rounded">
                {product.luxuryLabel}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded border-2 transition-colors flex-shrink-0 ${
                    selectedImageIndex === index 
                      ? 'border-black' 
                      : 'border-border hover:border-gray-dark'
                  }`}
                  style={{
                    backgroundImage: `url(${getMediaUrl(url)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-details-info">
          <h1 className="product-details-title">{product.name}</h1>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="product-details-price">€{product.price}</span>
              {hasDiscount && (
                <>
                  <span className="text-gray-dark line-through">€{product.oldPrice}</span>
                  <span className="text-green-600 text-sm font-semibold">
                    Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          {/* Description */}
          <p className="product-details-description mb-6">{product.description}</p>

          {/* Category & Tags */}
          <div className="mb-6">
            <p className="text-sm text-gray-dark mb-2"><strong>Category:</strong> {product.category}</p>
            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-dark mb-2"><strong>Tags:</strong></p>
                <div className="flex gap-2 flex-wrap">
                  {product.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-light px-3 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-2">Quantity</label>
            <div className="flex items-center border border-border rounded w-fit">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 hover:bg-gray-light transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 0) handleQuantityChange(val);
                }}
                className="w-12 text-center border-none outline-none"
                min="1"
                max={product.stock}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 hover:bg-gray-light transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={addToCart}
            disabled={product.stock <= 0}
            className="btn w-full flex items-center justify-center gap-2 mb-6"
          >
            <ShoppingCart size={20} />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>

          {/* Continue Shopping */}
          <Link to="/shop" className="btn-outline block text-center">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-serif font-bold mb-8">Related Products</h2>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <Link to={`/product/${p._id}`} key={p._id} className="product-card">
                <div
                  className="product-image"
                  style={{
                    backgroundImage: p.imageUrls?.length > 0
                      ? `url(${getMediaUrl(p.imageUrls[0])})`
                      : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {p.luxuryLabel && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 text-xs font-semibold uppercase rounded">
                      {p.luxuryLabel}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <div className="flex gap-2 items-center">
                    <span className="product-price">€{p.price}</span>
                    {p.oldPrice && (
                      <span className="text-gray-dark line-through text-sm">€{p.oldPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
