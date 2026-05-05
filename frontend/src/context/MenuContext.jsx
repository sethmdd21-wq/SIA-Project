import { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const initialMenuItems = [
  // Mains
  { id: 1, name: 'Classic Pork Adobo', price: '₱250.00', category: 'Mains', rating: 4.8, img: '/images/adobo.png', reviews: [] },
  { id: 2, name: 'Sinigang na Baboy', price: '₱320.00', category: 'Mains', rating: 4.9, img: '/images/sinigang.png', reviews: [] },
  { id: 4, name: 'Sizzling Sisig', price: '₱280.00', category: 'Mains', rating: 4.9, img: '/images/sisig.png', reviews: [] },
  { id: 5, name: 'Crispy Lechon Kawali', price: '₱350.00', category: 'Mains', rating: 4.8, img: '/images/lechon.png', reviews: [] },
  { id: 9, name: 'Kare-Kare', price: '₱380.00', category: 'Mains', rating: 4.8, img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 10, name: 'Chicken Inasal', price: '₱220.00', category: 'Mains', rating: 4.9, img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 11, name: 'Bicol Express', price: '₱280.00', category: 'Mains', rating: 4.7, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 12, name: 'Lechon Manok', price: '₱350.00', category: 'Mains', rating: 4.8, img: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 13, name: 'Pinakbet', price: '₱180.00', category: 'Mains', rating: 4.5, img: 'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80', reviews: [] },
  // Soups
  { id: 14, name: 'Bulalo', price: '₱450.00', category: 'Soups', rating: 4.9, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 15, name: 'Tinola', price: '₱220.00', category: 'Soups', rating: 4.7, img: 'https://images.unsplash.com/photo-1616039829688-b50c4a734be0?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 16, name: 'Nilaga', price: '₱280.00', category: 'Soups', rating: 4.6, img: 'https://images.unsplash.com/photo-1569347631120-a71baabd94a2?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 17, name: 'Sinigang na Bangus', price: '₱300.00', category: 'Soups', rating: 4.8, img: '/images/sinigang.png', reviews: [] },
  { id: 18, name: 'Arroz Caldo', price: '₱130.00', category: 'Soups', rating: 4.6, img: 'https://images.unsplash.com/photo-1516684732162-798a0ef67b79?auto=format&fit=crop&w=800&q=80', reviews: [] },
  // Noodles
  { id: 3, name: 'Pancit Canton', price: '₱180.00', category: 'Noodles', rating: 4.7, img: '/images/pancit.png', reviews: [] },
  { id: 19, name: 'Pancit Bihon', price: '₱160.00', category: 'Noodles', rating: 4.6, img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 20, name: 'Mami Noodle Soup', price: '₱150.00', category: 'Noodles', rating: 4.5, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', reviews: [] },
  // Starters
  { id: 6, name: 'Lumpiang Shanghai', price: '₱150.00', category: 'Starters', rating: 4.6, img: '/images/lumpia.png', reviews: [] },
  { id: 21, name: "Tokwa't Baboy", price: '₱120.00', category: 'Starters', rating: 4.5, img: 'https://images.unsplash.com/photo-1551963831-d1befb78ea6b?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 22, name: 'Ukoy', price: '₱130.00', category: 'Starters', rating: 4.4, img: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=800&q=80', reviews: [] },
  // Desserts
  { id: 7, name: 'Halo-Halo Supreme', price: '₱120.00', category: 'Desserts', rating: 4.8, img: '/images/halohalo.png', reviews: [] },
  { id: 23, name: 'Leche Flan', price: '₱90.00', category: 'Desserts', rating: 4.9, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 24, name: 'Ube Halaya', price: '₱100.00', category: 'Desserts', rating: 4.8, img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 25, name: 'Mango Float', price: '₱150.00', category: 'Desserts', rating: 4.9, img: 'https://images.unsplash.com/photo-1565958011-b1e54f14fe05?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 26, name: 'Biko', price: '₱80.00', category: 'Desserts', rating: 4.6, img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 27, name: 'Turon', price: '₱60.00', category: 'Desserts', rating: 4.7, img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=800&q=80', reviews: [] },
  // Drinks
  { id: 8, name: "Sago't Gulaman", price: '₱80.00', category: 'Drinks', rating: 4.7, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 28, name: 'Calamansi Juice', price: '₱60.00', category: 'Drinks', rating: 4.6, img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80', reviews: [] },
  { id: 29, name: 'Buko Juice', price: '₱70.00', category: 'Drinks', rating: 4.8, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', reviews: [] },
];

const defaultCategories = ['Mains', 'Soups', 'Noodles', 'Starters', 'Desserts', 'Drinks'];

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('sia_menu_items');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('sia_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('sia_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('sia_categories', JSON.stringify(categories));
  }, [categories]);

  const addReview = (foodId, rating, comment, user) => {
    setMenuItems(prevItems => prevItems.map(item => {
      if (item.id === foodId) {
        const newReview = {
          id: Date.now(),
          rating,
          comment,
          user: user.name || 'Anonymous User',
          date: new Date().toLocaleDateString()
        };
        const updatedReviews = [newReview, ...item.reviews];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = updatedReviews.length > 0 
          ? (totalRating / updatedReviews.length).toFixed(1) 
          : item.rating;
        return {
          ...item,
          rating: Number(newAvgRating),
          reviews: updatedReviews
        };
      }
      return item;
    }));
  };

  const replyToReview = (foodId, reviewId, replyText) => {
    setMenuItems(prevItems => prevItems.map(item => {
      if (item.id === foodId) {
        return {
          ...item,
          reviews: item.reviews.map(review => {
            if (review.id === reviewId) {
              return { ...review, reply: replyText };
            }
            return review;
          })
        };
      }
      return item;
    }));
  };

  const addMenuItem = (formData) => {
    setMenuItems(prev => [
      ...prev,
      { ...formData, id: Date.now(), rating: Number(formData.rating) || 4.5, reviews: [] }
    ]);
  };

  const editMenuItem = (id, formData) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...formData, rating: Number(formData.rating) || item.rating } : item
    ));
  };

  const deleteMenuItem = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
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
