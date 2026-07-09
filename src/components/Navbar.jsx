import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const navLinkClassName = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';
const adminLinkClassName = ({ isActive }) => isActive ? 'nav-link admin-link active' : 'nav-link admin-link';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)} aria-label="Go to homepage">
          VERZ
        </Link>

        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/about" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/faq" className={navLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>FAQ</NavLink>
          {user && user.role === 'admin' && (
            <NavLink to="/admin" className={adminLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-profile-nav">
              <span className="icon-btn user-avatar" aria-hidden="true">
                <User size={18} />
              </span>
              <span className="user-name">Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="icon-btn nav-icon-btn" aria-label="Account" title="Account">
              <User size={20} />
            </Link>
          )}
          <a
            href="https://www.amazon.in/s?k=verz&ref=nb_sb_noss"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn nav-icon-btn nav-amazon"
            aria-label="Amazon"
            title="Amazon"
          >
            <img src="/amazon logo.svg" alt="Amazon" className="amazon-logo" />
          </a>
          <Link to="/cart" className="icon-btn nav-icon-btn cart-icon" aria-label="Cart" title="Cart">
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>
          <button
            className="mobile-toggle icon-btn nav-icon-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
