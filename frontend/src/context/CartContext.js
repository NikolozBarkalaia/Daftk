import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingBag, X, Check, AlertCircle } from 'lucide-react';

/* ─── Context ─────────────────────────────────────────────── */
export const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

/* ─── Toast Component ─────────────────────────────────────── */
const TOAST_DURATION = 3000;

const Toast = ({ toasts, removeToast }) => (
  <div className="cart-toast-container" aria-live="polite" aria-atomic="false">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`cart-toast cart-toast--${t.type}`}
        role="status"
      >
        <span className="cart-toast__icon">
          {t.type === 'success' && <Check size={16} strokeWidth={2.5} />}
          {t.type === 'info'    && <ShoppingBag size={16} strokeWidth={2} />}
          {t.type === 'error'   && <AlertCircle size={16} strokeWidth={2} />}
        </span>
        <span className="cart-toast__msg">{t.message}</span>
        <button
          className="cart-toast__close"
          onClick={() => removeToast(t.id)}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

/* ─── Provider ────────────────────────────────────────────── */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  /* Persist on every change */
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    /* Notify other tabs / components listening to storage */
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  /* ── Toast helpers ── */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  /* ── Cart operations ── */
  const addToCart = useCallback((product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQty = existing.quantity + qty;
        showToast(`${product.name} — quantity updated to ${newQty}`);
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      showToast(`${product.name} added to bag`, 'success');
      return [
        ...prev,
        {
          _id:      product._id,
          name:     product.name,
          price:    product.price,
          oldPrice: product.oldPrice || null,
          image:    product.imageUrls?.[0] || product.image || '',
          stock:    product.stock ?? 99,
          quantity: qty,
        },
      ];
    });
  }, [showToast]);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i._id === id);
      if (item) showToast(`${item.name} removed from bag`, 'info');
      return prev.filter((i) => i._id !== id);
    });
  }, [showToast]);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.min(qty, item.stock ?? 99) }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    showToast('Your bag has been cleared', 'info');
  }, [showToast]);

  const isInCart = useCallback(
    (id) => cartItems.some((item) => item._id === id),
    [cartItems]
  );

  const cartCount    = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        cartCount,
        cartSubtotal,
        showToast,
      }}
    >
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </CartContext.Provider>
  );
};
