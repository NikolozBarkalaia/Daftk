import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';

const MiniCart = ({ open, onClose }) => {
  const { cartItems, removeFromCart, cartSubtotal, cartCount } = useCart();
  const ref = useRef(null);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Close on outside click */
  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open, onClose]);

  const preview = cartItems.slice(0, 4);
  const overflow = cartCount - preview.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      ref={ref}
      className={`mini-cart ${open ? 'mini-cart--open' : ''}`}
      role="dialog"
      aria-label="Shopping bag preview"
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="mini-cart__head">
        <span className="mini-cart__title">
          Your Bag
          {cartCount > 0 && <span className="mini-cart__count">{cartCount}</span>}
        </span>
        <button className="mini-cart__close" onClick={onClose} aria-label="Close bag preview">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      {cartItems.length === 0 ? (
        <div className="mini-cart__empty">
          <ShoppingBag size={40} strokeWidth={0.9} />
          <p>Your bag is empty</p>
          <Link to="/shop" className="btn" onClick={onClose} style={{ fontSize: '0.78rem', padding: '10px 20px' }}>
            Browse Collection
          </Link>
        </div>
      ) : (
        <>
          <ul className="mini-cart__list">
            {preview.map((item) => (
              <li key={`${item._id}-${item.selectedSize || 'no-size'}`} className="mini-cart__item">
                <Link
                  to={`/product/${item._id}`}
                  className="mini-cart__img-wrap"
                  onClick={onClose}
                >
                  {item.image ? (
                    <img
                      src={getMediaUrl(item.image)}
                      alt={item.name}
                      className="mini-cart__img"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="mini-cart__img-placeholder">
                      <ShoppingBag size={16} strokeWidth={1} />
                    </div>
                  )}
                </Link>

                <div className="mini-cart__info">
                  <Link
                    to={`/product/${item._id}`}
                    className="mini-cart__name"
                    onClick={onClose}
                  >
                    {item.name}
                  </Link>
                  <div className="mini-cart__meta">
                    {item.selectedSize && <span className="mini-cart__size">Size: {item.selectedSize}</span>}
                    <span className="mini-cart__qty">Qty: {item.quantity}</span>
                    <span className="mini-cart__price">₾{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="mini-cart__remove"
                  onClick={() => removeFromCart(item._id, item.selectedSize)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          {overflow > 0 && (
            <p className="mini-cart__overflow">+{overflow} more item{overflow !== 1 ? 's' : ''}</p>
          )}

          {/* Footer */}
          <div className="mini-cart__footer">
            <div className="mini-cart__subtotal">
              <span>Subtotal</span>
              <span>₾{cartSubtotal.toFixed(2)}</span>
            </div>
            <p className="mini-cart__shipping">Complimentary shipping</p>

            <Link to="/cart" className="btn mini-cart__view-btn" onClick={onClose}>
              View Bag <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniCart;
