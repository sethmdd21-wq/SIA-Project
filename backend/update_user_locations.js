const db = require('./db');

const updates = [
  { email: 'juan@gmail.com', address: '456 Magsaysay St, Brgy. Guadalupe, Makati City' },
  { email: 'maria@gmail.com', address: '789 Ibarra Lane, Brgy. San Lorenzo, Makati City' },
  { email: 'jose@gmail.com', address: '101 Dapitan St, Brgy. Calamba, Laguna' },
  { email: 'seth@gmail.com', address: '123 Admin Lane, Brgy. Central, Quezon City' }
];

async function updateLocations() {
  try {
    console.log('--- Updating User Locations ---');
    for (const u of updates) {
      await db.query('UPDATE users SET address = ? WHERE email = ?', [u.address, u.email]);
      console.log(`Updated location for: ${u.email}`);
    }
    console.log('--- Locations Updated Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error updating locations:', err.message);
    process.exit(1);
  }
}

updateLocations();
