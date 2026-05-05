import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, ShoppingBag, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount, toggleCart } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍽️</span> SIA Food
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className={`nav-links ${isActive('/')}`} onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/order" className={`nav-links ${isActive('/order')}`} onClick={() => setIsOpen(false)}>
              Order Delivery
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/takeout" className={`nav-links ${isActive('/takeout')}`} onClick={() => setIsOpen(false)}>
              Takeout
            </Link>
          </li>
          
          {user?.isAdmin && (
            <li className="nav-item">
              <Link to="/admin" className={`nav-links ${isActive('/admin')}`} onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            </li>
          )}
          {!user ? (
            <>
              <li className="nav-item">
                <Link to="/login" className={`nav-links ${isActive('/login')}`} onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item nav-btn-item">
                <Link to="/signup" className="btn-primary nav-btn" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </>
          ) : (
            <li className="nav-item nav-btn-item">
              <Link to="/profile" className="btn-secondary nav-btn" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> My Profile
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="cart-btn" aria-label="Cart" onClick={toggleCart}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
