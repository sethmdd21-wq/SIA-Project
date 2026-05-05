import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, Store, Clock, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Menu.css';

const Takeout = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { menuItems } = useMenu();
  const categories = ['All', 'Mains', 'Soups', 'Noodles', 'Starters', 'Desserts', 'Drinks'];

  const filteredMenu = menuItems
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => activeCategory === 'All' || item.category === activeCategory);

  const handleAdd = (e, item) => {
    e.stopPropagation();
    addToCart(item);
  };

  return (
    <>
      <div className="menu-page container animate-fade-in">
        <div className="menu-header glass-panel">
          <div className="menu-header-info">
            <h2><Store size={28} className="header-icon" /> Takeout Order</h2>
            <p>Order ahead and pick up at our restaurant.</p>
          </div>
          <div className="pickup-time-box">
            <Clock size={18} className="time-icon" />
            <div className="time-details">
              <span className="time-label">Estimated Prep Time</span>
              <span className="time-value">15 - 20 minutes</span>
            </div>
          </div>
        </div>

        <div className="menu-search-bar">
          <Search size={18} className="search-icon-inner" />
          <input
            type="text"
            placeholder="Search Filipino dishes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
          {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        <div className="category-tabs">
          {categories.map(category => (
            <button 
              key={category} 
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {menuItems.length === 0 ? (
          <div className="empty-search-state glass-panel animate-scale-in" style={{ padding: '4rem', marginTop: '2rem' }}>
            <div className="cooking-animation" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👨‍🍳</div>
            <h2 style={{ marginBottom: '1rem' }}>Our Kitchen is Getting Ready!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              We're currently setting up our official menu. Please check back in a few moments to see our delicious Filipino dishes!
            </p>
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="empty-search-state glass-panel animate-fade-in" style={{ padding: '3rem', marginTop: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <p>No dishes found for <strong>"{searchQuery}"</strong></p>
            <button className="btn-secondary" onClick={() => setSearchQuery('')}>Clear Search</button>
          </div>
        ) : (
          <div className="menu-table-wrapper">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenu.map(item => (
                  <tr key={item.id} className="menu-table-row" onClick={() => setSelectedFood(item)}>
                    <td><img src={item.img} alt={item.name} className="menu-table-thumb" /></td>
                    <td className="menu-table-name">{item.name}</td>
                    <td><span className="item-category">{item.category}</span></td>
                    <td className="menu-table-price">{item.price}</td>
                    <td>⭐ {item.rating}</td>
                    <td>
                      <button className="add-to-cart-btn" onClick={(e) => handleAdd(e, item)}>
                        <ShoppingBag size={16} /> Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedFood && createPortal(
        <FoodDetailsModal food={selectedFood} onClose={() => setSelectedFood(null)} />,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default Takeout;
