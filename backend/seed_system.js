const db = require('./db');

const users = [
  { name: 'Seth Admin', email: 'seth@gmail.com', password: 'P@$$w0rd', phone: '09171234567', address: '123 Admin Lane', isAdmin: 1 },
  { name: 'Juan Dela Cruz', email: 'juan@gmail.com', password: 'P@$$w0rd', phone: '09189876543', address: 'Quezon City, Manila', isAdmin: 0 },
  { name: 'Maria Clara', email: 'maria@gmail.com', password: 'P@$$w0rd', phone: '09191112222', address: 'Makati Business District', isAdmin: 0 },
  { name: 'Jose Rizal', email: 'jose@gmail.com', password: 'P@$$w0rd', phone: '09203334444', address: 'Calamba, Laguna', isAdmin: 0 }
];

const mockOrders = [
  {
    id: 'ORD-1001',
    user_email: 'juan@gmail.com',
    items: JSON.stringify([{ id: 21, name: 'Classic Chicken Adobo', price: 245, quantity: 2 }]),
    total: 490,
    type: 'Delivery',
    status: 'Delivered',
    paymentMethod: 'GCash',
    paymentStatus: 'Paid'
  },
  {
    id: 'ORD-1002',
    user_email: 'maria@gmail.com',
    items: JSON.stringify([{ id: 22, name: 'Pork Sinigang', price: 280, quantity: 1 }, { id: 25, name: 'Crispy Lumpia Shanghai', price: 150, quantity: 1 }]),
    total: 430,
    type: 'Takeout',
    status: 'Pending',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending'
  },
  {
    id: 'ORD-1003',
    user_email: 'jose@gmail.com',
    items: JSON.stringify([{ id: 23, name: 'Beef Bulalo', price: 450, quantity: 1 }]),
    total: 450,
    type: 'Delivery',
    status: 'Preparing',
    paymentMethod: 'COD',
    paymentStatus: 'Pending'
  }
];

const mockReviews = [
  { dish_id: 21, user_name: 'Juan Dela Cruz', rating: 5, comment: 'Best adobo I have ever tasted! Very tender.', reply: 'Thank you Juan! We use a special family recipe.' },
  { dish_id: 25, user_name: 'Maria Clara', rating: 4, comment: 'Very crispy and the sauce is perfect.', reply: null },
  { dish_id: 23, user_name: 'Jose Rizal', rating: 5, comment: 'The soup is very flavorful, highly recommended.', reply: 'Glad you liked it, Jose!' }
];

async function seedSystem() {
  try {
    console.log('--- Cleaning Tables ---');
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM users');
    
    console.log('--- Seeding Users ---');
    for (const u of users) {
      await db.query('INSERT INTO users (name, email, password, phone, address, isAdmin) VALUES (?, ?, ?, ?, ?, ?)', 
        [u.name, u.email, u.password, u.phone, u.address, u.isAdmin]);
      console.log(`User created: ${u.email}`);
    }

    console.log('--- Seeding Orders ---');
    for (const o of mockOrders) {
      await db.query('INSERT INTO orders (id, user_email, items, total, type, status, paymentMethod, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [o.id, o.user_email, o.items, o.total, o.type, o.status, o.paymentMethod, o.paymentStatus]);
      console.log(`Order created: ${o.id}`);
    }

    console.log('--- Seeding Reviews ---');
    for (const r of mockReviews) {
      await db.query('INSERT INTO reviews (dish_id, user_name, rating, comment, reply) VALUES (?, ?, ?, ?, ?)',
        [r.dish_id, r.user_name, r.rating, r.comment, r.reply]);
      console.log(`Review added for dish ${r.dish_id}`);
    }

    // Update menu_items ratings based on average reviews
    console.log('--- Updating Menu Ratings ---');
    const [dishes] = await db.query('SELECT id FROM menu_items');
    for (const dish of dishes) {
      const [ratingResult] = await db.query('SELECT AVG(rating) as avgRating FROM reviews WHERE dish_id = ?', [dish.id]);
      const avg = ratingResult[0].avgRating || 0.0;
      await db.query('UPDATE menu_items SET rating = ? WHERE id = ?', [avg, dish.id]);
    }

    console.log('--- System Seeded Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
}

seedSystem();
