import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import logo from "../assets/logo.jpeg"

const Navbar = () => {
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
          <Link to="/login"><User size={20} strokeWidth={1.5} /></Link>
          <Link to="/cart"><ShoppingBag size={20} strokeWidth={1.5} /></Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
