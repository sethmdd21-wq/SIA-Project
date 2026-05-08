const db = require('./db');
require('dotenv').config();

async function seedDemoAccounts() {
  try {
    console.log('Fetching menu items to attach orders/reviews to...');
    const [items] = await db.query('SELECT id, name, price FROM menu_items ORDER BY id LIMIT 6');
    if (!items || items.length === 0) {
      console.error('No menu_items found. Run `node seed.js` first to populate menu items.');
      process.exit(1);
    }

    const users = [
      { name: 'Admin User', email: 'admin@admin.com', password: 'P@$$w0rd', phone: '09170000001', address: 'Admin Address', isAdmin: 1 },
      { name: 'Demo Buyer One', email: 'demo1@example.com', password: 'P@$$w0rd', phone: '09170000002', address: 'Demo Address 1', isAdmin: 0 },
      { name: 'Demo Buyer Two', email: 'demo2@example.com', password: 'P@$$w0rd', phone: '09170000003', address: 'Demo Address 2', isAdmin: 0 }
    ];

    console.log('Inserting users (if they do not already exist)...');
    for (const u of users) {
      try {
        await db.query('INSERT INTO users (name, email, password, phone, address, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
          [u.name, u.email, u.password, u.phone, u.address, u.isAdmin]);
        console.log(`Inserted user: ${u.email}`);
      } catch (err) {
        // handle missing column or duplicate entries
        if (err && (err.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(err.message))) {
          try {
            await db.query('INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
              [u.name, u.email, u.password, u.phone, u.address]);
            console.log(`Inserted user (no isAdmin column): ${u.email}`);
          } catch (innerErr) {
            if (innerErr && innerErr.code === 'ER_DUP_ENTRY') {
              console.warn(`User already exists: ${u.email}`);
            } else {
              console.error(`Failed inserting user ${u.email}:`, innerErr.message);
            }
          }
        } else if (err && err.code === 'ER_DUP_ENTRY') {
          console.warn(`User already exists: ${u.email}`);
        } else {
          console.error(`Failed inserting user ${u.email}:`, err.message);
        }
      }
    }

    // Create two demo orders (one for demo1, one for demo2)
    console.log('Inserting demo orders...');
    const orderItems1 = [ { id: items[0].id, name: items[0].name, price: items[0].price, quantity: 2 } ];
    const orderItems2 = [
      { id: items[1].id, name: items[1].name, price: items[1].price, quantity: 1 }
    ];
    if (items[2]) {
      orderItems2.push({ id: items[2].id, name: items[2].name, price: items[2].price, quantity: 1 });
    }

    function computeTotal(list) {
      return list.reduce((s, it) => s + (it.price * (it.quantity || 1)), 0);
    }

    const orders = [
      {
        id: `DEMO-ORD-${Date.now()}-1`,
        user_email: 'demo1@example.com',
        items: JSON.stringify(orderItems1),
        total: computeTotal(orderItems1),
        type: 'Delivery',
        status: 'Delivered',
        paymentMethod: 'GCash',
        paymentStatus: 'Paid'
      },
      {
        id: `DEMO-ORD-${Date.now()}-2`,
        user_email: 'demo2@example.com',
        items: JSON.stringify(orderItems2),
        total: computeTotal(orderItems2),
        type: 'Takeout',
        status: 'Pending',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending'
      }
    ];

    for (const o of orders) {
      try {
        await db.query('INSERT INTO orders (id, user_email, items, total, type, status, paymentMethod, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [o.id, o.user_email, o.items, o.total, o.type, o.status, o.paymentMethod, o.paymentStatus]);
        console.log(`Inserted order: ${o.id} for ${o.user_email}`);
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          console.warn(`Order already exists: ${o.id}`);
        } else {
          console.error('Failed inserting order:', err.message);
        }
      }
    }

    // Insert demo reviews for some items
    console.log('Inserting demo reviews...');
    const demoReviews = [
      { dish_id: items[0].id, user_name: 'demo1@example.com', rating: 5, comment: 'Excellent! Loved it.' },
      { dish_id: items[1].id, user_name: 'demo2@example.com', rating: 4, comment: 'Very good, will order again.' }
    ];

    for (const r of demoReviews) {
      try {
        await db.query('INSERT INTO reviews (dish_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
          [r.dish_id, r.user_name, r.rating, r.comment]);
        console.log(`Inserted review for dish ${r.dish_id} by ${r.user_name}`);
      } catch (err) {
        console.error('Failed inserting review:', err.message);
      }
    }

    // Recompute average ratings for affected dishes
    console.log('Recomputing averaged ratings...');
    const affectedDishIds = Array.from(new Set(demoReviews.map(r => r.dish_id)));
    for (const dishId of affectedDishIds) {
      const [ratingResult] = await db.query('SELECT AVG(rating) as avgRating FROM reviews WHERE dish_id = ?', [dishId]);
      const avg = ratingResult && ratingResult[0] && ratingResult[0].avgRating ? ratingResult[0].avgRating : 0.0;
      await db.query('UPDATE menu_items SET rating = ? WHERE id = ?', [avg, dishId]);
      console.log(`Updated dish ${dishId} avg rating to ${avg}`);
    }

    console.log('Demo accounts, orders, and reviews seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding demo accounts error:', err.message);
    process.exit(1);
  }
}

seedDemoAccounts();
