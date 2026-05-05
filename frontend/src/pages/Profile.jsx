import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { User, Mail, Phone, MapPin, LogOut, Trash2, AlertTriangle, X, ShoppingBag, Clock, Truck, CheckCircle } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { orders, deleteOrder } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  
  // Filter orders for the current user
  const userOrders = orders.filter(o => o.user.email === user?.email);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordError('All fields are required.');
      return;
    }
    if (passwordData.new.length < 8 || !/[A-Za-z]/.test(passwordData.new) || !/[0-9]/.test(passwordData.new)) {
      setPasswordError('New password must be at least 8 characters and contain letters and numbers.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.current !== 'password123') { // Dummy check
      setPasswordError('Current password is incorrect. (Use "password123" for demo)');
      return;
    }
    
    // Simulate success
    setPasswordSuccess('Password successfully changed!');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deletePassword.length < 1) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }
    
    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteModal(false);
    } else {
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Preparing': return <ShoppingBag size={16} />;
      case 'Out for Delivery': return <Truck size={16} />;
      case 'Delivered': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="profile-page container animate-fade-in">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your details and track your orders</p>
      </div>

      <div className="profile-content">
        <div className="profile-left">
          <div className="profile-card glass-panel">
            <div className="profile-card-header">
              <h3>Personal Information</h3>
              <button className="btn-secondary edit-btn" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="profile-details">
              <div className="detail-group">
                <label><User size={16} /> Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>

              <div className="detail-group">
                <label><Mail size={16} /> Email Address</label>
                {isEditing ? (
                  <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              <div className="detail-group">
                <label><Phone size={16} /> Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleChange} />
                ) : (
                  <p>{user.phone}</p>
                )}
              </div>

              <div className="detail-group">
                <label><MapPin size={16} /> Delivery Address</label>
                {isEditing ? (
                  <textarea name="address" className="input-field" rows="2" value={formData.address} onChange={handleChange} />
                ) : (
                  <p>{user.address}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="save-actions">
                <button className="btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            )}
          </div>

          <div className="profile-card glass-panel">
            <div className="profile-card-header">
              <h3>Security</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="password-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {passwordError && <div className="error-alert"><AlertTriangle size={16}/> {passwordError}</div>}
              {passwordSuccess && <div className="success-alert">✓ {passwordSuccess}</div>}
              
              <div className="detail-group">
                <label>Current Password</label>
                <input type="password" name="current" className="input-field" value={passwordData.current} onChange={handlePasswordChange} placeholder="Enter current password" />
              </div>
              
              <div className="detail-group">
                <label>New Password</label>
                <input type="password" name="new" className="input-field" value={passwordData.new} onChange={handlePasswordChange} placeholder="Enter new password" />
              </div>

              <div className="detail-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirm" className="input-field" value={passwordData.confirm} onChange={handlePasswordChange} placeholder="Confirm new password" />
              </div>

              <div className="save-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-secondary">Update Password</button>
              </div>
            </form>
          </div>
        </div>

        <div className="profile-right">
          {!user.isAdmin && (
            <div className="profile-card glass-panel orders-card">
              <div className="profile-card-header">
                <h3><ShoppingBag size={20} /> Recent Orders</h3>
              </div>
              <div className="order-history-list">
                {userOrders.length === 0 ? (
                  <div className="empty-orders">
                    <ShoppingBag size={48} />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  userOrders.map(order => (
                    <div key={order.id} className="order-history-item">
                      <div className="order-item-header">
                        <span className="order-id">{order.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span className={`order-status-badge ${(order.status || 'Pending').toLowerCase().replace(/ /g, '-')}`}>
                            {getStatusIcon(order.status || 'Pending')}
                            {order.status || 'Pending'}
                          </span>
                          {order.status === 'Delivered' && (
                            <button className="delete-order-sm" onClick={() => deleteOrder(order.id)} title="Remove from history">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="order-item-body">
                        <div className="order-items-summary">
                          {(order.items || []).slice(0, 2).map(item => item.name).join(', ')}
                          {(order.items || []).length > 2 && ` +${order.items.length - 2} more`}
                        </div>
                        <div className="order-total-row">
                          <span className="order-date">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                          <span className="order-price">₱{Number(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="danger-zone glass-panel">
            <h3>Account Actions</h3>
            <div className="action-buttons">
              <button className="btn-secondary logout-btn" onClick={() => setShowLogoutModal(true)}>
                <LogOut size={18} /> Log Out
              </button>
              <button className="btn-secondary delete-btn" onClick={() => setShowDeleteModal(true)}>
                <Trash2 size={18} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showLogoutModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-scale-in">
            <div className="modal-icon warning-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <LogOut size={32} />
            </div>
            <h2>Confirm Log Out</h2>
            <p className="modal-desc">Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={logout}>Yes, Log Out</button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {showDeleteModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-in">
            <button className="close-modal-btn" onClick={() => setShowDeleteModal(false)}><X size={20}/></button>
            <div className="modal-icon warning-icon"><AlertTriangle size={32} /></div>
            <h2>Delete Account?</h2>
            <p className="modal-desc">This action is irreversible. All your order history and saved addresses will be permanently deleted.</p>
            
            <form onSubmit={handleDeleteSubmit} className="delete-form">
              <div className="input-group">
                <label>Please enter your password to confirm:</label>
                <input 
                  type="password" 
                  className={`input-field ${deleteError ? 'error-input' : ''}`} 
                  placeholder="Password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                />
                {deleteError && <span className="error-text">{deleteError}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary danger-btn">Permanently Delete</button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default Profile;
