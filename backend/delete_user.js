const db = require('./db');
require('dotenv').config();

const email = process.env.DELETE_EMAIL || 'seth@gmail.com';

async function deleteUser() {
  try {
    const [rows] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      console.log('No user found with email:', email);
      return process.exit(0);
    }

    await db.query('DELETE FROM users WHERE email = ?', [email]);
    console.log('Deleted user:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting user:', err.message);
    process.exit(1);
  }
}

deleteUser();
