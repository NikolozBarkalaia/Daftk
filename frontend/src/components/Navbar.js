import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import logo from "../assets/logo.jpeg";
import { useCart } from '../context/CartContext';
import MiniCart from './MiniCart';

const ORDERS_KEY = 'daftk_orders';
const STATUS_CACHE_KEY = 'daftk_order_statuses';
const INACTIVE_STATUSES = ['delivered', 'cancelled'];

const getActiveOrderCount = () => {
  try {
    const tokens = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
      .map((e) => (typeof e === 'string' ? e : e.token))
      .filter(Boolean);
    if (tokens.length === 0) return 0;
    const cache = JSON.parse(localStorage.getItem(STATUS_CACHE_KEY) || '{}');
    // Count tokens where we either have no status info, or status is not inactive
    return tokens.filter((t) => !INACTIVE_STATUSES.includes(cache[t])).length;
  } catch {
    return 0;
  }
};

const Navbar = () => {
  const { cartCount } = useCart();
  const [miniOpen, setMiniOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState(getActiveOrderCount);
  const hoverTimer = useRef(null);

  // Sync badge when localStorage changes (from Checkout, MyOrders, etc.)
  useEffect(() => {
    const sync = () => setActiveOrders(getActiveOrderCount());
    window.addEventListener('ordersUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ordersUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const openMini = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setMiniOpen(true);
  }, []);

  const closeMini = useCallback(() => {
    hoverTimer.current = setTimeout(() => setMiniOpen(false), 120);
  }, []);

  const keepOpen = useCallback(() => {
    clearTimeout(hoverTimer.current);
  }, []);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="Logo" className='h-10 ' />
        </Link>
        <div className="nav-links">
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="nav-icons">
          <Link to="/orders" className="nav-orders-link" title="My Orders" style={{ position: 'relative' }}>
            Orders
            {activeOrders > 0 && (
              <span className="nav-cart-badge" style={{ top: '-6px', right: '-14px' }}>
                {activeOrders > 99 ? '99+' : activeOrders}
              </span>
            )}
          </Link>

          {/* Cart icon + mini-cart dropdown */}
          <div
            className="nav-cart-wrapper"
            onMouseEnter={openMini}
            onMouseLeave={closeMini}
          >
            <Link
              to="/cart"
              className="nav-cart-link"
              aria-label={`Shopping bag, ${cartCount} items`}
              onClick={() => setMiniOpen(false)}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            <div onMouseEnter={keepOpen} onMouseLeave={closeMini}>
              <MiniCart open={miniOpen} onClose={closeMini} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
