const db = require('./db');

async function check() {
  try {
    const [rows] = await db.query('DESCRIBE menu_items');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
