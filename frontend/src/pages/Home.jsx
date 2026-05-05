import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, Star, Clock, Truck, UtensilsCrossed, MessageSquare, BarChart2, TrendingUp, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import FoodDetailsModal from '../components/FoodDetailsModal';
import './Home.css';

/* ─── Admin Home ─────────────────────────────────────────── */
const AdminHome = ({ user, menuItems = [] }) => {
  const totalReviews = menuItems.reduce((s, i) => s + (i.reviews?.length || 0), 0);
  const avgRating = menuItems.length
    ? (menuItems.reduce((s, i) => s + (Number(i.rating) || 0), 0) / menuItems.length).toFixed(1)
    : '—';
  
  const topDish = menuItems.length > 0 
    ? [...menuItems].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] 
    : null;
    
  const categories = [...new Set(menuItems.map(i => i.category))].filter(Boolean);

  // Flatten all reviews across all items, newest first
  const allReviews = menuItems
    .flatMap(item => (item.reviews || []).map(r => ({ ...r, dishName: item.name, dishImg: item.img })))
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    .slice(0, 10);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="admin-home animate-fade-in">
      {/* Welcome Banner */}
      <section className="admin-welcome glass-panel">
        <div className="admin-welcome-text">
          <h1>Welcome back, <span className="text-gradient">{user.name}</span> 👋</h1>
          <p>Here's what's happening on SIA Food today.</p>
        </div>
        <Link to="/admin" className="btn-primary admin-goto-btn">
          <LayoutDashboard size={18} /> Manage Menu
        </Link>
      </section>

      {/* Stats */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card glass-panel">
          <div className="stat-icon-wrap stat-blue"><UtensilsCrossed size={24} /></div>
          <div>
            <div className="stat-big">{menuItems.length}</div>
            <div className="stat-lbl">Total Dishes</div>
          </div>
        </div>
        <div className="admin-stat-card glass-panel">
          <div className="stat-icon-wrap stat-green"><MessageSquare size={24} /></div>
          <div>
            <div className="stat-big">{totalReviews}</div>
            <div className="stat-lbl">Total Reviews</div>
          </div>
        </div>
        <div className="admin-stat-card glass-panel">
          <div className="stat-icon-wrap stat-yellow"><Star size={24} /></div>
          <div>
            <div className="stat-big">{avgRating}</div>
            <div className="stat-lbl">Avg. Rating</div>
          </div>
        </div>
        <div className="admin-stat-card glass-panel">
          <div className="stat-icon-wrap stat-red"><BarChart2 size={24} /></div>
          <div>
            <div className="stat-big">{categories.length}</div>
            <div className="stat-lbl">Categories</div>
          </div>
        </div>
      </section>

      {/* Top Performer + Category Breakdown */}
      <section className="admin-mid-grid">
        {topDish && (
          <div className="admin-card glass-panel">
            <h3 className="admin-card-title"><TrendingUp size={18} /> Top Rated Dish</h3>
            <div className="top-dish-row">
              <img src={topDish.img} alt={topDish.name} className="top-dish-img" />
              <div>
                <div className="top-dish-name">{topDish.name}</div>
                <div className="top-dish-cat">{topDish.category}</div>
                <div className="top-dish-rating">⭐ {topDish.rating} · {topDish.price}</div>
              </div>
            </div>
          </div>
        )}

        <div className="admin-card glass-panel">
          <h3 className="admin-card-title"><BarChart2 size={18} /> Dishes by Category</h3>
          <div className="category-breakdown">
            {categories.map(cat => {
              const count = menuItems.filter(i => i.category === cat).length;
              const pct = Math.round((count / menuItems.length) * 100);
              return (
                <div key={cat} className="cat-row">
                  <span className="cat-name">{cat}</span>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="cat-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="admin-card glass-panel admin-reviews-section">
        <h3 className="admin-card-title"><MessageSquare size={18} /> Recent Customer Reviews</h3>
        {allReviews.length === 0 ? (
          <div className="no-reviews-admin">
            <MessageSquare size={28} />
            <p>No reviews yet. Reviews from customers will appear here.</p>
          </div>
        ) : (
          <div className="admin-reviews-table-wrapper">
            <table className="admin-reviews-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allReviews.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="review-dish-cell">
                        <img src={r.dishImg} alt={r.dishName} className="review-dish-thumb" />
                        <span>{r.dishName}</span>
                      </div>
                    </td>
                    <td>{r.user_name || 'Anonymous'}</td>
                    <td>
                      <span className="review-stars-cell">
                        {'⭐'.repeat(Number(r.rating) || 5)}
                      </span>
                    </td>
                    <td className="review-comment-cell">{r.comment || <em style={{ opacity: 0.5 }}>No comment</em>}</td>
                    <td>{formatDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

/* ─── Customer Home ──────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { menuItems } = useMenu();
  const [selectedFood, setSelectedFood] = useState(null);

  // Show admin view if logged in as admin
  if (user?.isAdmin) {
    return <AdminHome user={user} menuItems={menuItems} />;
  }

  const featuredFoods = menuItems.slice(0, 4);

  const handleAdd = (e, food) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { message: 'Please log in to add items to your cart.' } });
      return;
    }
    addToCart({ ...food, category: food.category });
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge glass-panel">🔥 Hot &amp; Fresh Delivery</div>
            <h1 className="hero-title">
              Satisfy Your Cravings, <br />
              <span className="text-gradient">Delivered Fast.</span>
            </h1>
            <p className="hero-desc">
              Experience the finest Filipino culinary delights, delivered right to your doorstep or ready for quick takeout. Quality you can taste.
            </p>
            <div className="hero-buttons">
              <Link to="/order" className="btn-primary hero-btn">
                Order Now <ArrowRight size={18} />
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
