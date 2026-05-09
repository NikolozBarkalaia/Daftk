import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';

/* ─── Empty State ─────────────────────────────────────────── */
const EmptyCart = () => (
  <div className="cart-empty">
    <div className="cart-empty__icon">
      <ShoppingBag size={64} strokeWidth={0.8} />
    </div>
    <h2 className="cart-empty__title">Your bag is empty</h2>
    <p className="cart-empty__sub">
      Looks like you haven't added anything yet.<br />
      Discover our curated collection.
    </p>
    <Link to="/shop" className="btn cart-empty__cta">
      Explore Collection
    </Link>
  </div>
);

/* ─── Cart Item Row ───────────────────────────────────────── */
const CartItem = ({ item, onUpdate, onRemove }) => {
  const lineTotal   = (item.price * item.quantity).toFixed(2);
  const hasDiscount = item.oldPrice && item.oldPrice > item.price;

  return (
    <div className="cart-item">
      <Link to={`/product/${item._id}`} className="cart-item__img-wrap">
        {item.image ? (
          <img
            src={getMediaUrl(item.image)}
            alt={item.name}
            className="cart-item__img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="cart-item__img-placeholder">
            <ShoppingBag size={22} strokeWidth={1} />
          </div>
        )}
      </Link>

      <div className="cart-item__info">
        <Link to={`/product/${item._id}`} className="cart-item__name">{item.name}</Link>
        <div className="cart-item__prices">
          <span className="cart-item__price">€{item.price}</span>
          {hasDiscount && (
            <span className="cart-item__old-price">€{item.oldPrice}</span>
          )}
        </div>
      </div>

      <div className="cart-item__qty">
        <button
          className="cart-item__qty-btn"
          onClick={() => onUpdate(item._id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >
          <Minus size={13} />
        </button>
        <span className="cart-item__qty-val">{item.quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => onUpdate(item._id, item.quantity + 1)}
          disabled={item.quantity >= (item.stock ?? 99)}
          aria-label="Increase quantity"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="cart-item__total">€{lineTotal}</div>

      <button
        className="cart-item__remove"
        onClick={() => onRemove(item._id)}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

/* ─── Order Summary ───────────────────────────────────────── */
const OrderSummary = ({ subtotal, itemCount, onClear }) => {
  const [coupon, setCoupon]           = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total    = subtotal - discount;

  const handleCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'DAFTK10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid promo code');
    }
  };

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary__title">Order Summary</h2>

      <div className="cart-summary__lines">
        <div className="cart-summary__line">
          <span>Items ({itemCount})</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        {couponApplied && (
          <div className="cart-summary__line cart-summary__line--discount">
            <span>Discount (10%)</span>
            <span>−€{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-summary__line">
          <span>Shipping</span>
          <span className="cart-summary__free">Complimentary</span>
        </div>
      </div>

      <form onSubmit={handleCoupon} className="cart-coupon">
        <div className="cart-coupon__wrap">
          <Tag size={15} className="cart-coupon__icon" />
          <input
            type="text"
            value={coupon}
            onChange={(e) => { setCoupon(e.target.value); setCouponError(''); }}
            placeholder="Promo code"
            className="cart-coupon__input"
            disabled={couponApplied}
          />
          <button
            type="submit"
            className="cart-coupon__btn"
            disabled={couponApplied || !coupon.trim()}
          >
            {couponApplied ? '✓' : 'Apply'}
          </button>
        </div>
        {couponApplied && <p className="cart-coupon__success">10% discount applied!</p>}
        {couponError   && <p className="cart-coupon__error">{couponError}</p>}
      </form>

      <div className="cart-summary__divider" />

      <div className="cart-summary__total">
        <span>Total</span>
        <span>€{total.toFixed(2)}</span>
      </div>

      {discount > 0 && (
        <p className="cart-summary__savings">
          You're saving €{discount.toFixed(2)}
        </p>
      )}

      <button className="btn cart-summary__checkout" disabled title="Checkout coming soon">
        Checkout <ArrowRight size={17} />
      </button>
      <p className="cart-summary__checkout-note">Secure checkout — coming soon</p>

      <Link to="/shop" className="btn-outline cart-summary__continue">
        Continue Shopping
      </Link>

      <button className="cart-summary__clear" onClick={onClear}>
        Remove all items
      </button>
    </aside>
  );
};

/* ─── Main Cart Page ──────────────────────────────────────── */
const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartCount, cartSubtotal } = useCart();

  const handleClear = () => {
    if (window.confirm('Remove all items from your bag?')) clearCart();
  };

  if (cartItems.length === 0) {
    return <div className="container pb-20"><EmptyCart /></div>;
  }

  return (
    <div className="container pb-20">
      <div className="cart-header">
        <h1 className="cart-header__title">Shopping Bag</h1>
        <span className="cart-header__count">
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="cart-layout">
        <section className="cart-items" aria-label="Cart items">
          <div className="cart-items__labels">
            <span>Product</span>
            <span className="cart-label-qty">Quantity</span>
            <span className="cart-label-total">Total</span>
          </div>

          <div className="cart-items__list">
            {cartItems.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        </section>

        <OrderSummary subtotal={cartSubtotal} itemCount={cartCount} onClear={handleClear} />
      </div>
    </div>
  );
};

export default Cart;
