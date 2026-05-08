const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- AUTH ENDPOINTS ---

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  try {
    // 1. Check if user exists
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (userRows.length === 0) {
      console.log('Login failed: Email not found');
      return res.status(401).json({ message: 'Invalid Credentials: Email not found' });
    }

    const user = userRows[0];

    // 2. Check if password matches
    if (user.password !== password) {
      console.log('Login failed: Incorrect password');
      return res.status(401).json({ message: 'Invalid Credentials: Incorrect password' });
    }

    // Success
    delete user.password;
    console.log('Login successful');
    res.json(user);
    
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    // ensure `isAdmin` column exists so we can set admin based on email domain
    try {
      const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'isAdmin'");
      if (!cols || cols.length === 0) {
        await db.query('ALTER TABLE users ADD COLUMN isAdmin TINYINT DEFAULT 0');
      }
    } catch (e) {
      // ignore failures here; INSERT below will still work if column missing in some DB setups
      console.warn('Warning checking/creating isAdmin column:', e.message);
    }

    const isAdminFlag = email && String(email).toLowerCase().endsWith('@admin.com') ? 1 : 0;

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, address, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, phone, address, isAdminFlag]
    );

    res.json({ id: result.insertId, name, email, phone, address, isAdmin: Boolean(isAdminFlag) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by email (used by frontend to refresh auth state)
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, address, isAdmin FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    // Normalize isAdmin to boolean for the frontend
    user.isAdmin = Boolean(user.isAdmin);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
app.put('/api/users/:email', async (req, res) => {
  const { name, phone, address } = req.body;
  const { email } = req.params;
  try {
    await db.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE email = ?',
      [name, phone, address, email]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Account
app.delete('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  try {
    await db.query('DELETE FROM users WHERE email = ?', [email]);
    res.json({ message: 'Account deleted permanently' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MENU ENDPOINTS ---

// Get all food with reviews
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu_items');
    const [reviews] = await db.query('SELECT * FROM reviews ORDER BY date DESC');
    
    const menuWithReviews = rows.map(item => ({
      ...item,
      reviews: reviews.filter(r => r.dish_id === item.id)
    }));
    
    res.json(menuWithReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add food
app.post('/api/menu', async (req, res) => {
  const { name, price, category, img, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO menu_items (name, price, category, img, description) VALUES (?, ?, ?, ?, ?)',
      [name, price, category, img, description]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update food
app.put('/api/menu/:id', async (req, res) => {
  const { name, price, category, img, description } = req.body;
  try {
    await db.query(
      'UPDATE menu_items SET name = ?, price = ?, category = ?, img = ?, description = ? WHERE id = ?',
      [name, price, category, img, description, req.params.id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete food
app.delete('/api/menu/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER ENDPOINTS ---

// Get all orders with user details (for Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, u.name as user_name, u.phone as user_phone, u.address as user_address
      FROM orders o
      LEFT JOIN users u ON o.user_email = u.email
      ORDER BY o.createdAt DESC
    `);

    const orders = rows.map(o => {
      let items = [];
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch (e) {
        console.error('Failed to parse order items:', e);
      }
      return { 
        ...o, 
        items,
        user: { name: o.user_name || 'Unknown User', email: o.user_email, phone: o.user_phone },
        details: { phone: o.user_phone || 'No Phone' } // Satisfy frontend expectations
      };
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place order
app.post('/api/orders', async (req, res) => {
  const { id, user, items, total, type, paymentMethod, paymentStatus } = req.body;
  const user_email = user?.email;
  try {
    await db.query(
      'INSERT INTO orders (id, user_email, items, total, type, paymentMethod, paymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, user_email, JSON.stringify(items), total, type, paymentMethod, paymentStatus]
    );
    res.json({ id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  const { status, riderId, paymentStatus } = req.body;
  try {
    let query = 'UPDATE orders SET status = ?';
    let params = [status];
    if (riderId) { query += ', riderId = ?'; params.push(riderId); }
    if (paymentStatus) { query += ', paymentStatus = ?'; params.push(paymentStatus); }
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RIDER ENDPOINTS ---

app.get('/api/riders', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM riders');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/riders', async (req, res) => {
  const { name, phone, vehicle, plate, model } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO riders (name, phone, vehicle, plate, model) VALUES (?, ?, ?, ?, ?)',
      [name, phone, vehicle, plate, model]
    );
    res.json({ id: result.insertId, ...req.body, status: 'Available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/riders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE riders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Rider status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEW ENDPOINTS ---
app.post('/api/reviews', async (req, res) => {
  const { dish_id, user_name, rating, comment } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO reviews (dish_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [dish_id, user_name, rating, comment]
    );

    // Recalculate average rating for the dish and persist it on the menu_items table
    try {
      const [ratingResult] = await db.query(
        'SELECT AVG(rating) as avgRating FROM reviews WHERE dish_id = ?',
        [dish_id]
      );
      const avg = ratingResult && ratingResult[0] ? ratingResult[0].avgRating || 0.0 : 0.0;
      await db.query('UPDATE menu_items SET rating = ? WHERE id = ?', [avg, dish_id]);
      res.json({ id: result.insertId, ...req.body, avgRating: avg });
    } catch (innerErr) {
      console.error('Failed to update aggregated rating:', innerErr.message);
      // Still return success for the inserted review, but warn frontend
      res.json({ id: result.insertId, ...req.body, warning: 'Review saved but failed to update dish rating' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/reply', async (req, res) => {
  const { reply } = req.body;
  try {
    await db.query('UPDATE reviews SET reply = ? WHERE id = ?', [reply, req.params.id]);
    res.json({ message: 'Reply added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
