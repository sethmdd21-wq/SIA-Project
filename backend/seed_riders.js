const db = require('./db');

const mockRiders = [
  { name: 'Ricardo Dalisay', phone: '09123456789', vehicle: 'Motorcycle', plate: 'RD-8888', model: 'Honda Click 125i', status: 'Available' },
  { name: 'Cardo Dalisay', phone: '09171112222', vehicle: 'Bicycle', plate: 'NONE', model: 'Mountain Bike', status: 'Available' },
  { name: 'Pepito Manaloto', phone: '09183334444', vehicle: 'Car', plate: 'PM-7777', model: 'Toyota Vios', status: 'Busy' },
  { name: 'Noli De Castro', phone: '09195556666', vehicle: 'Motorcycle', plate: 'NC-1234', model: 'Yamaha Mio', status: 'Available' }
];

async function seedRiders() {
  try {
    console.log('--- Seeding Riders ---');
    // Clear existing riders first if needed, but the user just said "add some"
    // await db.query('DELETE FROM riders');
    
    for (const r of mockRiders) {
      await db.query(
        'INSERT INTO riders (name, phone, vehicle, plate, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [r.name, r.phone, r.vehicle, r.plate, r.model, r.status]
      );
      console.log(`Rider added: ${r.name}`);
    }
    
    console.log('--- Riders Seeded Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding riders:', err.message);
    process.exit(1);
  }
}

seedRiders();
