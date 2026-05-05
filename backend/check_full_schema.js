const db = require('./db');

async function checkSchemas() {
  try {
    const tables = ['users', 'orders', 'reviews'];
    for (const table of tables) {
      console.log(`--- Schema for ${table} ---`);
      const [rows] = await db.query(`DESCRIBE ${table}`);
      console.log(rows);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchemas();
