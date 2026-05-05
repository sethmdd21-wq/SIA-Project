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
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, phone, address]
    );
    res.json({ id: result.insertId, name, email, phone, address, isAdmin: 0 });
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

// --- MENU ENDPOINTS ---

// Get all food
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM menu_items');
    res.json(rows);
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

// Get all orders (for Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC');
    const orders = rows.map(o => {
      let items = [];
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch (e) {
        console.error('Failed to parse order items:', e);
      }
      return { ...o, items };
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place order
app.post('/api/orders', async (req, res) => {
  const { id, user_email, items, total, type, paymentMethod, paymentStatus } = req.body;
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
    res.json({ id: result.insertId, ...req.body });
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
