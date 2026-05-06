const db = require('./db');
require('dotenv').config();

const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
const name = process.env.ADMIN_NAME || 'Admin User';
const password = process.env.ADMIN_PASS || 'admin123';
const phone = process.env.ADMIN_PHONE || '09000000000';
const address = process.env.ADMIN_ADDRESS || 'Admin Address';

async function ensureIsAdminColumn() {
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'isAdmin'");
    if (!cols || cols.length === 0) {
      console.log('`isAdmin` column missing — adding it.');
      await db.query('ALTER TABLE users ADD COLUMN isAdmin TINYINT DEFAULT 0');
      console.log('Added `isAdmin` column to users table.');
    }
  } catch (err) {
    console.error('Failed checking/adding isAdmin column:', err.message);
    process.exit(1);
  }
}

async function createAdmin() {
  try {
    await ensureIsAdminColumn();

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      console.log('User already exists:', email);
      // If user exists but not admin, promote them
      if (!existing[0].isAdmin) {
        await db.query('UPDATE users SET isAdmin = 1 WHERE email = ?', [email]);
        console.log('Existing user promoted to admin.');
      }
      return process.exit(0);
    }

    await db.query('INSERT INTO users (name, email, password, phone, address, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, phone, address, 1]
    );

    console.log('Admin user created:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
}

createAdmin();
