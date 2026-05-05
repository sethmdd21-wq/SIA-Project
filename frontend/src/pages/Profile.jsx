import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, LogOut, Trash2, AlertTriangle, X } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (deletePassword === 'password123') { // Dummy check since no real backend
      deleteAccount();
    } else if (deletePassword.length < 1) {
      setDeleteError('Please enter your password to confirm.');
    } else {
      // For this demo, let's just let them delete it no matter what, but show error if empty
      // Actually, let's simulate a success for any non-empty password just so the user can test the flow
      deleteAccount();
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page container animate-fade-in">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your details and preferences</p>
      </div>

      <div className="profile-content">
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
            <h3>Change Password</h3>
          </div>
          <form onSubmit={handlePasswordSubmit} className="password-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {passwordError && <div style={{ color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16}/> {passwordError}</div>}
            {passwordSuccess && <div style={{ color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✓ {passwordSuccess}</div>}
            
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

        <div className="danger-zone glass-panel">
          <h3>Account Actions</h3>
          <div className="action-buttons">
            <button className="btn-secondary logout-btn" onClick={logout}>
              <LogOut size={18} /> Log Out
            </button>
            <button className="btn-secondary delete-btn" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
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
        </div>
      )}
    </div>
  );
};

export default Profile;
