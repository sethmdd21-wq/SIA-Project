import { X, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartSidebar.css';

const CartSidebar = () => {
  const { isCartOpen, closeCart, cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <div className="cart-sidebar glass-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Order</h2>
          <button className="close-cart-btn" onClick={closeCart}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-cart-emoji">🛒</span>
              <p>Your basket is empty.</p>
              <p className="empty-cart-sub">Add some delicious food to get started!</p>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cart.map(item => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{item.price}</span>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <span>Subtotal:</span>
              <span className="cart-total-price">₱{cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={() => { 
              const isTakeoutPage = window.location.pathname === '/takeout';
              closeCart(); 
              navigate('/checkout', { state: { type: isTakeoutPage ? 'takeout' : 'delivery' } }); 
            }}>
              <CreditCard size={18} /> Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
