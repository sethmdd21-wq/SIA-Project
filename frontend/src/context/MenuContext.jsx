import { createContext, useContext, useState } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const initialMenuItems = [
  { id: 1, name: 'Classic Pork Adobo', price: '₱250.00', category: 'Mains', rating: 4.8, img: '/images/adobo.png', reviews: [] },
  { id: 2, name: 'Sinigang na Baboy', price: '₱320.00', category: 'Mains', rating: 4.9, img: '/images/sinigang.png', reviews: [] },
  { id: 3, name: 'Pancit Canton', price: '₱180.00', category: 'Noodles', rating: 4.7, img: '/images/pancit.png', reviews: [] },
  { id: 4, name: 'Sizzling Sisig', price: '₱280.00', category: 'Mains', rating: 4.9, img: '/images/sisig.png', reviews: [] },
  { id: 5, name: 'Crispy Lechon Kawali', price: '₱350.00', category: 'Mains', rating: 4.8, img: '/images/lechon.png', reviews: [] },
  { id: 6, name: 'Lumpiang Shanghai', price: '₱150.00', category: 'Starters', rating: 4.6, img: '/images/lumpia.png', reviews: [] },
  { id: 7, name: 'Halo-Halo Supreme', price: '₱120.00', category: 'Desserts', rating: 4.8, img: '/images/halohalo.png', reviews: [] },
  { id: 8, name: "Sago't Gulaman", price: '₱80.00', category: 'Drinks', rating: 4.7, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', reviews: [] },
];

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState(initialMenuItems);

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
        
        // Calculate new average rating
        // Default rating has some weight, let's just make it simple: 
        // average of all user reviews, or if we want to keep the initial rating as a base:
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

  return (
    <MenuContext.Provider value={{ menuItems, addReview }}>
      {children}
    </MenuContext.Provider>
  );
};
