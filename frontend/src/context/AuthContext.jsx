import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('sia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sia_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sia_user');
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('sia_user', JSON.stringify(newUser));
  };

  const deleteAccount = () => {
    setUser(null);
    localStorage.removeItem('sia_user');
    // In a real app, this would make an API call to delete the DB record
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
