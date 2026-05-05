import { useState } from 'react';
import { ShoppingBag, Truck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Menu.css';

const Order = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
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

export default Order;
