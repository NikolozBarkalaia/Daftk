import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

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
        {item.selectedSize && (
          <div className="text-xs text-gray-dark mt-1 font-medium uppercase">
            Size: <span className="text-black">{item.selectedSize}</span>
          </div>
        )}
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
          onClick={() => onUpdate(item._id, item.quantity - 1, item.selectedSize)}
          aria-label="Decrease quantity"
        >
          <Minus size={13} />
        </button>
        <span className="cart-item__qty-val">{item.quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => onUpdate(item._id, item.quantity + 1, item.selectedSize)}
          disabled={item.quantity >= (item.sizeStock?.[item.selectedSize] ?? item.stock ?? 99)}
          aria-label="Increase quantity"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="cart-item__total">€{lineTotal}</div>

      <button
        className="cart-item__remove"
        onClick={() => onRemove(item._id, item.selectedSize)}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

/* ─── Order Summary ───────────────────────────────────────── */
const OrderSummary = ({ subtotal, itemCount, onClear }) => {
  return (
    <aside className="cart-summary">
      <h2 className="cart-summary__title">Order Summary</h2>

      <div className="cart-summary__lines">
        <div className="cart-summary__line">
          <span>Items ({itemCount})</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-summary__line">
          <span>Shipping</span>
          <span className="cart-summary__free">Complimentary</span>
        </div>
      </div>

      <div className="cart-summary__divider" />

      <div className="cart-summary__total">
        <span>Total</span>
        <span>€{subtotal.toFixed(2)}</span>
      </div>

      <Link to="/checkout" className="btn cart-summary__checkout">
        Checkout <ArrowRight size={17} />
      </Link>
      <p className="cart-summary__checkout-note">Free shipping on all orders</p>

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
  const { confirm } = useNotification();

  const handleClear = async () => {
    const isConfirmed = await confirm({
      title: 'Clear Bag',
      message: 'Remove all items from your bag?',
      confirmText: 'Remove All',
      danger: true
    });
    if (isConfirmed) clearCart();
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
                 key={`${item._id}-${item.selectedSize || 'no-size'}`}
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
