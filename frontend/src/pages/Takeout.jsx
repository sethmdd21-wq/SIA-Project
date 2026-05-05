import { useState } from 'react';
import { ShoppingBag, Store, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Menu.css';

const Takeout = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const { addToCart } = useCart();
  const { menuItems } = useMenu();
  const categories = ['All', 'Mains', 'Noodles', 'Starters', 'Desserts', 'Drinks'];

  const filteredMenu = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleAdd = (e, item) => {
    e.stopPropagation();
    addToCart(item);
  };

  return (
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

      <div className="menu-grid">
        {filteredMenu.map(item => (
          <div key={item.id} className="menu-item-card card" onClick={() => setSelectedFood(item)} style={{ cursor: 'pointer' }}>
            <div className="item-img-wrapper">
              <img src={item.img} alt={item.name} className="food-image" />
            </div>
            <div className="item-details">
              <span className="item-category">{item.category}</span>
              <h3 className="item-name">{item.name}</h3>
              <div className="item-bottom">
                <span className="item-price">{item.price}</span>
                <button className="add-to-cart-btn" onClick={(e) => handleAdd(e, item)}>
                  <ShoppingBag size={18} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFood && (
        <FoodDetailsModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}
    </div>
  );
};

export default Takeout;
