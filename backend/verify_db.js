const db = require('./db');

async function verify() {
  try {
    const [rows] = await db.query('SELECT id, name, category, price, rating FROM menu_items');
    console.log('--- DATABASE MENU ITEMS ---');
    if (rows.length === 0) {
      console.log('No items found in the database.');
    } else {
      console.table(rows);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
}

verify();
