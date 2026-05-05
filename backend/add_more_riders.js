const db = require('./db');

const moreRiders = [
  { name: 'Vic Sotto', phone: '09221112222', vehicle: 'Motorcycle', plate: 'VS-1010', model: 'Honda Beat', status: 'Available' },
  { name: 'Joey De Leon', phone: '09234445555', vehicle: 'Bicycle', plate: 'NONE', model: 'BMX', status: 'Available' },
  { name: 'Tito Sotto', phone: '09247778888', vehicle: 'Car', plate: 'TS-2020', model: 'Mitsubishi Mirage', status: 'Available' },
  { name: 'Maine Mendoza', phone: '09259990000', vehicle: 'Motorcycle', plate: 'MM-5555', model: 'Vespa Sprint', status: 'Available' },
  { name: 'Alden Richards', phone: '09261234567', vehicle: 'Motorcycle', plate: 'AR-7777', model: 'Kawasaki Ninja', status: 'Busy' }
];

async function addMoreRiders() {
  try {
    console.log('--- Adding More Riders ---');
    for (const r of moreRiders) {
      await db.query(
        'INSERT INTO riders (name, phone, vehicle, plate, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [r.name, r.phone, r.vehicle, r.plate, r.model, r.status]
      );
      console.log(`Rider added: ${r.name}`);
    }
    
    console.log('--- Additional Riders Added Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error adding more riders:', err.message);
    process.exit(1);
  }
}

addMoreRiders();
