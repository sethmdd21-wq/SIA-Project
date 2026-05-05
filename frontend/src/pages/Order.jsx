import { useState } from 'react';
import { ShoppingBag, Truck, MapPin, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Menu.css';

const Order = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
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
    <div className="menu-page container animate-fade-in">
      <div className="menu-header glass-panel">
        <div className="menu-header-info">
          <h2><Truck size={28} className="header-icon" /> Delivery Order</h2>
          <p>Get your favorite food delivered right to your door.</p>
        </div>
        <div className="delivery-address-box">
          <MapPin size={18} className="address-icon" />
          <div className="address-details">
            <span className="address-label">Delivering to</span>
            <span className="address-value">{user?.address || '123 Foodie Street, FC 12345'}</span>
          </div>
          <button className="btn-secondary change-btn">Change</button>
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

      {filteredMenu.length === 0 ? (
        <div className="empty-search-state">
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

      {selectedFood && (
        <FoodDetailsModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}
    </div>
  );
};

export default Order;
