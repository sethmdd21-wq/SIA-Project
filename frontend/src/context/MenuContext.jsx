import { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const API_URL = 'http://localhost:5000/api';

const defaultCategories = ['Mains', 'Soups', 'Noodles', 'Starters', 'Desserts', 'Drinks'];

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${API_URL}/menu`);
      if (response.ok) {
        const data = await response.json();
        // Ensure every item has a reviews array to prevent crashes
        const enrichedData = data.map(item => ({
          ...item,
          reviews: item.reviews || []
        }));
        setMenuItems(enrichedData);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addReview = async (foodId, rating, comment, user) => {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish_id: foodId, user_name: user.name, rating, comment })
      });
      if (response.ok) fetchMenu();
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  const replyToReview = async (foodId, reviewId, replyText) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      if (response.ok) fetchMenu();
    } catch (err) {
      console.error('Failed to reply to review:', err);
    }
  };

  const addMenuItem = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) fetchMenu();
    } catch (err) {
      console.error('Failed to add menu item:', err);
    }
  };

  const editMenuItem = async (id, formData) => {
    // Note: Backend PUT for menu items not fully implemented in snippet, 
    // but logic would be similar to addMenuItem
    fetchMenu(); 
  };

  const deleteMenuItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) fetchMenu();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  const addCategory = (name) => {
    if (!categories.includes(name)) {
      setCategories(prev => [...prev, name]);
    }
  };

  const deleteCategory = (name) => {
    setCategories(prev => prev.filter(cat => cat !== name));
  };

  return (
    <MenuContext.Provider value={{ 
      menuItems, 
      categories,
      loading,
      addReview, 
      replyToReview,
      addMenuItem, 
      editMenuItem, 
      deleteMenuItem,
      addCategory,
      deleteCategory
    }}>
      {children}
    </MenuContext.Provider>
  );
};
