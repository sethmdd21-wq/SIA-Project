import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  
  // If already logged in, redirect to home
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const message = location.state?.message;

  const validate = (name, value) => {
    let error = '';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email format';
    }
    if (name === 'password' && value.length < 1) {
      error = 'Password is required';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const errorMsg = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
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

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setErrors({ auth: result.message || 'Invalid Credentials' });
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        {message && (
          <div className="auth-alert" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <AlertCircle size={20} /> {message}
          </div>
        )}

        {errors.auth && (
          <div className="auth-alert">
            <AlertCircle size={20} /> {errors.auth}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text"><AlertCircle size={14}/> {errors.password}</span>}
          </div>
          
          <div className="forgot-password">
            <a href="#" className="auth-link">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
