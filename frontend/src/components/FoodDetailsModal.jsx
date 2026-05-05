import { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { useNavigate } from 'react-router-dom';
import './FoodDetailsModal.css';

const FoodDetailsModal = ({ food: initialFood, onClose }) => {
  const { user } = useAuth();
  const { menuItems, addReview } = useMenu();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!initialFood) return null;

  const food = menuItems.find(item => item.id === initialFood.id) || initialFood;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      navigate('/login', { state: { message: 'Please log in to leave a review.' } });
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    
    addReview(food.id, rating, comment, user);
    setRating(0);
    setComment('');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="food-modal animate-scale-in glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-img-placeholder">
              <img src={food.img} alt={food.name} className="modal-image" />
            </div>
            <div className="modal-info">
              <span className="modal-category">{food.category}</span>
              <h2 className="modal-title">{food.name}</h2>
              <div className="modal-rating">
                <Star size={18} className="star-icon" fill="currentColor" />
                <span>{food.rating} ({food.reviews?.length || 0} reviews)</span>
              </div>
              <span className="modal-price">{food.price}</span>
            </div>
          </div>

          <div className="modal-reviews-section">
            <h3>Reviews & Comments</h3>
            
            <div className="reviews-list">
              {food.reviews && food.reviews.length > 0 ? (
                food.reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="review-user">{review.user}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= review.rating ? "star-filled" : "star-empty"} 
                          fill={star <= review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    {review.comment && <p className="review-text">{review.comment}</p>}
                    {review.reply && (
                      <div className="admin-reply-bubble">
                        <div className="reply-label">Admin Response:</div>
                        <p>{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <MessageSquare size={24} />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>

            <form className="add-review-form" onSubmit={handleSubmitReview}>
              <h4>Add your review</h4>
              {error && <div className="review-error">{error}</div>}
              
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-btn ${star <= (hoveredRating || rating) ? "active" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star size={24} fill={star <= (hoveredRating || rating) ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              
              <div className="comment-input-wrapper">
                <textarea
                  placeholder="Share your thoughts about this dish..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              
              <button type="submit" className="submit-review-btn btn-primary">
                <Send size={16} /> Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
