import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('sia_user');
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        (async () => {
          try {
            const resp = await fetch(`${API_URL}/users/${encodeURIComponent(parsed.email)}`);
            if (resp.ok) {
              const fresh = await resp.json();
              const normalized = { ...fresh, isAdmin: Boolean(fresh.isAdmin) };
              setUser(normalized);
              localStorage.setItem('sia_user', JSON.stringify(normalized));
            } else {
              parsed.isAdmin = Boolean(parsed.isAdmin);
              setUser(parsed);
            }
          } catch (err) {
            parsed.isAdmin = Boolean(parsed.isAdmin);
            setUser(parsed);
          } finally {
            setLoading(false);
          }
        })();
        return;
      } catch (err) {
        // ignore parse errors
      }
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
        const normalized = { ...userData, isAdmin: Boolean(userData.isAdmin) };
        setUser(normalized);
        localStorage.setItem('sia_user', JSON.stringify(normalized));
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
        const normalized = { ...newUser, isAdmin: Boolean(newUser.isAdmin) };
        setUser(normalized);
        localStorage.setItem('sia_user', JSON.stringify(normalized));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.error || errorData.message || 'Signup failed' };
      }
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, message: "Oops! We're having a bit of trouble connecting to our kitchen. Please try again in a moment." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sia_user');
    try {
      localStorage.removeItem('sia_cart');
      window.dispatchEvent(new Event('sia_clear_cart'));
    } catch (e) {
      // ignore in environments without window/localStorage
    }
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

  const deleteAccount = async () => {
    try {
      await fetch(`${API_URL}/users/${user.email}`, {
        method: 'DELETE'
      });
      setUser(null);
      localStorage.removeItem('sia_user');
      // Also clear persisted cart and notify cart context to clear in-memory state
      try {
        localStorage.removeItem('sia_cart');
        window.dispatchEvent(new Event('sia_clear_cart'));
      } catch (e) {
        // ignore (e.g., during SSR or unusual environments)
      }
      return { success: true };
    } catch (err) {
      console.error('Delete account error:', err);
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, deleteAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
