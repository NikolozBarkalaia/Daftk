import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, updateQuantity, isInCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

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
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const addToCartHandler = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="container py-20 text-center">Loading...</div>;

  if (!product) {
    return <div className="container py-20 text-center text-gray-dark">Product not found</div>;
  }

  const mainImage    = product.imageUrls?.[selectedImageIndex];
  const hasDiscount  = product.oldPrice && product.oldPrice > product.price;
  const cartItem     = cartItems.find((i) => i._id === product._id);

  return (
    <div className="container pb-20">
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) handleQuantityChange(val);
                }}
                className="w-12 text-center border-none outline-none"
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

          {/* In-cart status strip */}
          {cartItem && (
            <div className="pdp-in-cart">
              <Check size={15} className="pdp-in-cart__icon" />
              <span className="pdp-in-cart__msg">
                {cartItem.quantity} {cartItem.quantity === 1 ? 'unit' : 'units'} in your bag
              </span>
              <div className="pdp-in-cart__actions">
                <div className="pdp-in-cart__qty">
                  <button
                    className="pdp-in-cart__qty-btn"
                    onClick={() => updateQuantity(cartItem._id, cartItem.quantity - 1)}
                    aria-label="Decrease cart quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button
                    className="pdp-in-cart__qty-btn"
                    onClick={() => updateQuantity(cartItem._id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= (product.stock ?? 99)}
                    aria-label="Increase cart quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <Link to="/cart" className="pdp-in-cart__view">View Bag →</Link>
                <button
                  className="pdp-in-cart__remove"
                  onClick={() => removeFromCart(product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={addToCartHandler}
            disabled={product.stock <= 0}
            className={`btn w-full !flex items-center justify-center gap-2 mb-3 whitespace-nowrap transition-all ${added ? 'bg-green-700 border-green-700' : ''}`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {product.stock <= 0 ? 'Out of Stock' : added ? 'Added to Bag!' : cartItem ? 'Add More to Bag' : 'Add to Bag'}
          </button>

          {/* Continue Shopping */}
          <Link to="/shop" className="btn btn-outline w-full !flex items-center justify-center gap-2 whitespace-nowrap">
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
