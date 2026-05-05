import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('sia_user', JSON.stringify(userData));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server connection failed. Is the backend running?' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser);
        localStorage.setItem('sia_user', JSON.stringify(newUser));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Signup failed' };
      }
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, message: 'Server connection failed. Is the backend running?' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sia_user');
  };

  const updateProfile = async (updatedData) => {
    const response = await fetch(`${API_URL}/users/${user.email}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    if (response.ok) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('sia_user', JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false };
  };

  const deleteAccount = () => {
    setUser(null);
    localStorage.removeItem('sia_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
