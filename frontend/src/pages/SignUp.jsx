import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!/^\d+$/.test(value)) {
          error = 'Phone must contain only numbers';
        } else if (value.length < 10 || value.length > 11) {
          error = 'Phone must be 10 or 11 digits';
        }
        break;
      case 'address':
        if (!value.trim() || value.trim().length < 10) error = 'Please enter a complete delivery address';
        break;
      case 'password':
        // Require 8 chars, 1 letter, 1 number
        if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
          error = 'Password must contain letters and numbers';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: 'Only digits are allowed' }));
      return; 
    }

    setFormData({ ...formData, [name]: value });
    
    const errorMsg = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0 || Object.values(formData).some(v => v === '')) {
      setErrors(newErrors);
      return;
    }

    // Success - log the user in using Context
    login({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    });
    
    navigate('/');
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join SIA Food for fast delivery and easy takeout</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="input-group">
              <div className="input-icon-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className={`input-field auth-input ${errors.name ? 'error-input' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <span className="error-text"><AlertCircle size={14}/> {errors.name}</span>}
            </div>

            <div className="input-group">
              <div className="input-icon-wrapper">
                <Phone size={20} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className={`input-field auth-input ${errors.phone ? 'error-input' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <span className="error-text"><AlertCircle size={14}/> {errors.phone}</span>}
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className={`input-field auth-input ${errors.email ? 'error-input' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="error-text"><AlertCircle size={14}/> {errors.email}</span>}
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper" style={{ alignItems: 'flex-start', paddingTop: '12px' }}>
              <MapPin size={20} className="input-icon" />
              <textarea
                name="address"
                placeholder="Full Delivery Address"
                rows="3"
                className={`input-field auth-input ${errors.address ? 'error-input' : ''}`}
                style={{ resize: 'none' }}
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
            {errors.address && <span className="error-text"><AlertCircle size={14}/> {errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <div className="input-icon-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`input-field auth-input ${errors.password ? 'error-input' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text"><AlertCircle size={14}/> {errors.password}</span>}
            </div>

            <div className="input-group">
              <div className="input-icon-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`input-field auth-input ${errors.confirmPassword ? 'error-input' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text"><AlertCircle size={14}/> {errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
