import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, CreditCard, ShoppingBag, Truck, Clock, CheckCircle, MessageSquare, X } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderType, setOrderType] = useState(location.state?.type || 'delivery'); // 'delivery' or 'takeout'

  const [formData, setFormData] = useState({
    address: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'COD',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const isTakeout = orderType === 'takeout';

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="checkout-empty container">
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => navigate('/order')}>Go to Menu</button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Phone validation (PH format: 09XXXXXXXXX - 11 digits)
    const phonePattern = /^09\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      setPhoneError('Please enter a valid 11-digit phone number starting with 09');
      return;
    }
    setPhoneError('');

    if (formData.paymentMethod === 'GCash' && !orderComplete) {
      setShowGCashModal(true);
      return;
    }
    processOrder();
  };

  const processOrder = async () => {
    setIsProcessing(true);
    setShowGCashModal(false);

    try {
      const orderData = {
        user: { name: user.name, email: user.email },
        items: cart,
        total: cartTotal + (isTakeout ? 0 : 49),
        type: isTakeout ? 'Takeout' : 'Delivery',
        details: formData,
        paymentStatus: formData.paymentMethod === 'GCash' ? 'Paid' : 'Unpaid',
        paymentMethod: formData.paymentMethod
      };

      const newOrder = await placeOrder(orderData);
      if (newOrder) {
        clearCart();
        setOrderComplete(newOrder);
      } else {
        alert('Failed to place order. Please check your connection and try again.');
      }
    } catch (err) {
      console.error('Order processing error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="order-success-page container animate-fade-in">
        <div className="success-card glass-panel">
          <div className="success-icon-wrap">
            <CheckCircle size={80} className="success-icon" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-id">Order ID: <span>{orderComplete.id}</span></p>
          <div className="success-details">
            <p>Thank you for your order, <strong>{user.name}</strong>!</p>
            <p>We've received your {orderComplete.type.toLowerCase()} request and our kitchen is starting to prepare your authentic Filipino meal.</p>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/profile')}>Track My Order</button>
            <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade-in">
      <div className="checkout-header">
        <h1><CreditCard size={32} /> Checkout</h1>
        <div className="order-type-toggle glass-panel">
          <button 
            className={`type-toggle-btn ${!isTakeout ? 'active' : ''}`}
            onClick={() => setOrderType('delivery')}
          >
            <Truck size={18} /> Delivery
          </button>
          <button 
            className={`type-toggle-btn ${isTakeout ? 'active' : ''}`}
            onClick={() => setOrderType('takeout')}
          >
            <ShoppingBag size={18} /> Pickup
          </button>
        </div>
      </div>

      <div className="checkout-grid">
        <form className="checkout-form glass-panel" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><MapPin size={20} /> {isTakeout ? 'Pickup Details' : 'Delivery Address'}</h3>
            {!isTakeout && (
              <div className="form-group">
                <label>Complete Address</label>
                <textarea 
                  name="address" 
                  required 
                  placeholder="Street name, House/Unit No., Barangay, City"
                  value={formData.address}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            )}
            <div className="form-group">
              <label>Contact Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="09XXXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                className={phoneError ? 'error-input' : ''}
              />
              {phoneError && <span className="error-text" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3><CreditCard size={20} /> Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="COD" 
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange} 
                />
                <div className="option-content">
                  <span className="option-title">{isTakeout ? 'Pay at Counter' : 'Cash on Delivery'}</span>
                  <span className="option-desc">Pay when you {isTakeout ? 'arrive' : 'receive your food'}</span>
                </div>
              </label>
              <label className={`payment-option ${formData.paymentMethod === 'GCash' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="GCash" 
                  checked={formData.paymentMethod === 'GCash'}
                  onChange={handleInputChange} 
                />
                <div className="option-content">
                  <span className="option-title">GCash</span>
                  <span className="option-desc">Pay via GCash QR/Number</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3><MessageSquare size={20} /> Special Instructions</h3>
            <div className="form-group">
              <textarea 
                name="notes" 
                placeholder="e.g. No onions, make it spicy, or landmarks for delivery"
                value={formData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          <button type="submit" className="btn-primary place-order-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : (formData.paymentMethod === 'GCash' ? 'Pay with GCash' : `Place ${isTakeout ? 'Takeout' : 'Delivery'} Order`)}
          </button>
        </form>

        {showGCashModal && (
          <div className="admin-modal-overlay" onClick={() => setShowGCashModal(false)}>
            <div className="admin-modal gcash-modal glass-panel animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="gcash-modal-header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/GCash_logo.svg/1280px-GCash_logo.svg.png" alt="GCash" className="gcash-logo-img" />
                <button className="close-btn" onClick={() => setShowGCashModal(false)}><X size={20} /></button>
              </div>
              <div className="gcash-modal-body">
                <h3>Scan to Pay</h3>
                <div className="qr-container">
                  <div className="qr-placeholder" style={{ background: '#0055ff', padding: '10px', borderRadius: '12px' }}>
                    <img 
                      src="/gcash-qr.png" 
                      alt="GCash QR Code" 
                      onError={(e) => e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SIA-FOOD-PAYMENT-AMOUNT-${cartTotal + (isTakeout ? 0 : 49)}`} 
                      style={{ background: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                    />
                  </div>
                </div>
                <div className="payment-info">
                  <div className="info-row">
                    <span>Merchant</span>
                    <strong>SIA Food Restaurant</strong>
                  </div>
                  <div className="info-row">
                    <span>Amount</span>
                    <strong className="text-gradient">₱{(cartTotal + (isTakeout ? 0 : 49)).toFixed(2)}</strong>
                  </div>
                </div>
                <p className="gcash-instructions">Scan the QR code above and input the amount. After payment, click <strong>"I have paid"</strong> below.</p>
              </div>
              <div className="gcash-modal-footer">
                <button className="btn-primary full-width" onClick={processOrder}>I have paid</button>
              </div>
            </div>
          </div>
        )}

        <div className="order-summary glass-panel">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">₱{(parseFloat(item.price.replace('₱', '')) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            {!isTakeout && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₱49.00</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₱{(cartTotal + (isTakeout ? 0 : 49)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
