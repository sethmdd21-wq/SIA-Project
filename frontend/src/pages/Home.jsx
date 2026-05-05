import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { menuItems } = useMenu();
  const [selectedFood, setSelectedFood] = useState(null);

  const featuredFoods = menuItems.slice(0, 4);

  const handleAdd = (e, food) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to add items to your cart.' } });
      return;
    }
    // Need to match the category for cart display consistency even if not strictly required
    const foodItem = { ...food, category: 'Popular' }; 
    addToCart(foodItem);
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge glass-panel">🔥 Hot & Fresh Delivery</div>
            <h1 className="hero-title">
              Satisfy Your Cravings, <br />
              <span className="text-gradient">Delivered Fast.</span>
            </h1>
            <p className="hero-desc">
              Experience the finest culinary delights from top chefs, delivered right to your doorstep or ready for quick takeout. Quality you can taste.
            </p>
            <div className="hero-buttons">
              <Link to="/order" className="btn-primary hero-btn">
                Order Delivery <ArrowRight size={18} />
              </Link>
              <Link to="/takeout" className="btn-secondary hero-btn">
                Pick up Takeout
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-blob"></div>
            <div className="hero-image-placeholder glass-panel">
              <span className="hero-emoji">🥘</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Clock size={32} /></div>
          <h3>Lightning Fast</h3>
          <p>Get your food delivered in under 30 minutes, piping hot.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Truck size={32} /></div>
          <h3>Live Tracking</h3>
          <p>Track your order in real-time from the kitchen to your door.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Star size={32} /></div>
          <h3>Premium Quality</h3>
          <p>We only source ingredients from top-rated local producers.</p>
        </div>
      </section>

      {/* Featured Foods Section */}
      <section className="featured-section container">
        <div className="section-header">
          <h2 className="section-title">Popular Dishes</h2>
          <Link to="/order" className="view-all-link">View Full Menu <ArrowRight size={16} /></Link>
        </div>
        
        <div className="food-grid">
          {featuredFoods.map(food => (
            <div key={food.id} className="food-card card" onClick={() => setSelectedFood(food)} style={{ cursor: 'pointer' }}>
              <div className="food-img-placeholder">
                <img src={food.img} alt={food.name} className="food-image" />
              </div>
              <div className="food-info">
                <div className="food-rating">
                  <Star size={14} className="star-icon" /> {food.rating}
                </div>
                <h3 className="food-name">{food.name}</h3>
                <div className="food-card-bottom">
                  <span className="food-price">{food.price}</span>
                  <button className="add-btn" aria-label="Add to cart" onClick={(e) => handleAdd(e, food)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedFood && (
        <FoodDetailsModal food={selectedFood} onClose={() => setSelectedFood(null)} />
      )}
    </div>
  );
};

export default Home;
