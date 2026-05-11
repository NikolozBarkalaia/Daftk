import React, { useState, useCallback, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import logo from "../assets/logo.jpeg";
import { useCart } from '../context/CartContext';
import MiniCart from './MiniCart';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user } = useContext(AuthContext);
  const [miniOpen, setMiniOpen] = useState(false);
  const hoverTimer = useRef(null);

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
          {user && (
            <Link to="/orders" className="nav-orders-link" title="My Orders">
              Orders
            </Link>
          )}

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
