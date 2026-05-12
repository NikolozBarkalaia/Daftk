import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, updateQuantity, isInCart, cartItems } = useCart();
  const { showSuccess } = useNotification();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
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

      // Default select first available size
      const sStock = productRes.data.sizeStock || {};
      const availableSizes = ['XS', 'S', 'M', 'L', 'XL'].filter(s => (sStock[s] || 0) > 0);
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      } else {
        // If no sizes have stock, default to first size (it will be disabled)
        setSelectedSize('XS');
      }

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
    const maxStock = selectedSize && product?.sizeStock?.[selectedSize] !== undefined
      ? product.sizeStock[selectedSize]
      : (product?.stock || 1);

    if (newQuantity > 0 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const sizeStock = product?.sizeStock?.[size] || 0;
    // Cap quantity to available stock for the selected size
    if (quantity > sizeStock) {
      setQuantity(Math.max(1, sizeStock));
    }
  };

  const addToCartHandler = () => {
    // Validate stock before adding
    const canAdd = !cartItem || (cartItem.quantity + quantity <= currentSizeStock);
    if (!canAdd) return; // Stock limit reached, don't add
    addToCart(product, quantity, selectedSize);
    showSuccess(`${product.name} (${selectedSize}) added to bag`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="container py-20 text-center">Loading...</div>;

  if (!product) {
    return <div className="container py-20 text-center text-gray-dark">Product not found</div>;
  }

  const mainImage = product.imageUrls?.[selectedImageIndex];
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const cartItem = cartItems.find((i) => i._id === product._id && i.selectedSize === selectedSize);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const currentSizeStock = product.sizeStock?.[selectedSize] || 0;

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
            {product.hasBadge && product.badgeText && (
              <div
                className="absolute top-4 left-4 px-4 py-2 text-sm font-semibold uppercase rounded"
                style={{
                  backgroundColor: product.badgeBgColor,
                  color: product.badgeTextColor,
                }}
              >
                {product.badgeText}
              </div>
            )}

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
                  className={`w-20 h-20 rounded border-2 transition-colors flex-shrink-0 ${selectedImageIndex === index
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
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium block mb-3 uppercase tracking-wider">Choose Size</label>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((size) => {
                const stock = product.sizeStock?.[size] || 0;
                const isOutOfStock = stock <= 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && handleSizeChange(size)}
                    disabled={isOutOfStock}
                    className={`
                      min-w-[50px] h-[45px] flex items-center justify-center border transition-all duration-200 text-sm font-semibold
                      ${isSelected
                        ? 'border-black bg-black text-white'
                        : isOutOfStock
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50 line-through'
                          : 'border-border hover:border-black text-gray-800'}
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-dark">
              {selectedSize && (
                currentSizeStock > 0
                  ? <span className="text-green-600 font-medium">{currentSizeStock} available in size {selectedSize}</span>
                  : <span className="text-red-500 font-medium">Size {selectedSize} is currently unavailable</span>
              )}
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
                min="1"
                max={currentSizeStock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleQuantityChange(val);
                }}
                className="w-12 text-center border-none outline-none"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 hover:bg-gray-light transition-colors"
                disabled={quantity >= currentSizeStock}
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
                    onClick={() => updateQuantity(cartItem._id, cartItem.quantity - 1, selectedSize)}
                    aria-label="Decrease cart quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button
                    className="pdp-in-cart__qty-btn"
                    onClick={() => updateQuantity(cartItem._id, cartItem.quantity + 1, selectedSize)}
                    disabled={cartItem.quantity >= currentSizeStock}
                    aria-label="Increase cart quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <Link to="/cart" className="pdp-in-cart__view">View Bag →</Link>
                <button
                  className="pdp-in-cart__remove"
                  onClick={() => removeFromCart(product._id, selectedSize)}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={addToCartHandler}
            disabled={currentSizeStock <= 0 || (cartItem && cartItem.quantity + quantity > currentSizeStock)}
            className={`btn w-full !flex items-center justify-center gap-2 mb-3 whitespace-nowrap transition-all ${added ? 'bg-green-700 border-green-700' : ''}`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {currentSizeStock <= 0 ? 'Size Out of Stock' : (cartItem && cartItem.quantity + quantity > currentSizeStock) ? 'Exceeds Stock Limit' : added ? 'Added to Bag!' : cartItem ? 'Add More to Bag' : 'Add to Bag'}
          </button>

          <Link to="/shop" className="btn btn-outline w-full !flex items-center justify-center gap-2 whitespace-nowrap">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Related Products */}

    </div>
  );
};

export default Product;
