const db = require('./db');

const menuItems = [
  {
    name: 'Classic Chicken Adobo',
    price: 245.00,
    category: 'Mains',
    img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=400',
    description: 'Tender chicken braised in soy sauce, vinegar, garlic, and peppercorns. A Filipino classic.',
    rating: 0.0
  },
  {
    name: 'Pork Sinigang',
    price: 280.00,
    category: 'Soups',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400',
    description: 'Sour tamarind soup with pork belly, radish, string beans, and water spinach.',
    rating: 0.0
  },
  {
    name: 'Beef Bulalo',
    price: 450.00,
    category: 'Soups',
    img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400',
    description: 'Savory beef shank soup with bone marrow, corn on the cob, and bok choy.',
    rating: 0.0
  },
  {
    name: 'Pancit Bihon Guisado',
    price: 195.00,
    category: 'Noodles',
    img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400',
    description: 'Stir-fried rice noodles with chicken, shrimp, and mixed vegetables.',
    rating: 0.0
  },
  {
    name: 'Crispy Lumpia Shanghai',
    price: 150.00,
    category: 'Starters',
    img: 'https://images.unsplash.com/photo-1606335543042-57c525922933?auto=format&fit=crop&w=400',
    description: 'Crispy fried spring rolls filled with ground pork and carrots. Served with sweet chili sauce.',
    rating: 0.0
  },
  {
    name: 'Special Halo-Halo',
    price: 125.00,
    category: 'Desserts',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400',
    description: 'Layered dessert with crushed ice, evaporated milk, various beans, jelly, and ube ice cream.',
    rating: 0.0
  },
  {
    name: 'Creamy Leche Flan',
    price: 95.00,
    category: 'Desserts',
    img: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=400',
    description: 'Rich and smooth caramel custard made with egg yolks and condensed milk.',
    rating: 0.0
  },
  {
    name: 'Sago\'t Gulaman',
    price: 45.00,
    category: 'Drinks',
    img: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=400',
    description: 'Refreshingly sweet drink with tapioca pearls and gelatin in brown sugar syrup.',
    rating: 0.0
  },
  {
    name: 'Beef Kare-Kare',
    price: 380.00,
    category: 'Mains',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400',
    description: 'Oxtail and tripe stew in a rich peanut sauce, served with shrimp paste on the side.',
    rating: 0.0
  },
  {
    name: 'Pancit Palabok',
    price: 210.00,
    category: 'Noodles',
    img: 'https://images.unsplash.com/photo-1612392062631-94ec8c9a79e5?auto=format&fit=crop&w=400',
    description: 'Rice noodles with a thick shrimp sauce, topped with pork cracklings, shrimp, and boiled egg.',
    rating: 0.0
  }
];

async function seed() {
  try {
    console.log('Cleaning existing menu items...');
    await db.query('DELETE FROM menu_items');
    
    console.log('Seeding new menu items with 0.0 ratings...');
    for (const item of menuItems) {
      await db.query(
        'INSERT INTO menu_items (name, price, category, img, description, rating) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.price, item.category, item.img, item.description, item.rating]
      );
      console.log(`Added: ${item.name}`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
}

seed();
