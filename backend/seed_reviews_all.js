const db = require('./db');
require('dotenv').config();

async function seedReviewsAll() {
  try {
    console.log('Fetching menu items...');
    const [items] = await db.query('SELECT id, name FROM menu_items');
    if (!items || items.length === 0) {
      console.error('No menu_items found. Run `node seed.js` first to populate menu items.');
      process.exit(1);
    }

    const reviewers = [
      { name: 'Alice Reviewer', email: 'alice@example.com', password: 'P@$$w0rd', phone: '09170000010', address: 'Demo Address 1' },
      { name: 'Bob Reviewer', email: 'bob@example.com', password: 'P@$$w0rd', phone: '09170000011', address: 'Demo Address 2' },
      { name: 'Carol Reviewer', email: 'carol@example.com', password: 'P@$$w0rd', phone: '09170000012', address: 'Demo Address 3' },
      { name: 'Dave Reviewer', email: 'dave@example.com', password: 'P@$$w0rd', phone: '09170000013', address: 'Demo Address 4' }
    ];

    console.log('Ensuring reviewer user accounts exist...');
    for (const u of reviewers) {
      try {
        await db.query('INSERT INTO users (name, email, password, phone, address, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
          [u.name, u.email, u.password, u.phone, u.address, 0]);
        console.log(`Inserted user: ${u.email}`);
      } catch (err) {
        // Fallback if isAdmin column missing
        if (err && (err.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(err.message))) {
          try {
            await db.query('INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
              [u.name, u.email, u.password, u.phone, u.address]);
            console.log(`Inserted user (no isAdmin column): ${u.email}`);
          } catch (innerErr) {
            if (innerErr && innerErr.code === 'ER_DUP_ENTRY') {
              console.log(`User already exists: ${u.email}`);
            } else {
              console.error(`Failed inserting user ${u.email}:`, innerErr.message);
            }
          }
        } else if (err && err.code === 'ER_DUP_ENTRY') {
          console.log(`User already exists: ${u.email}`);
        } else {
          console.error(`Failed inserting user ${u.email}:`, err.message);
        }
      }
    }

    const comments = [
      'Absolutely delicious, highly recommend!',
      'Good portion and flavor.',
      'Tasty but could use less salt.',
      'Excellent — will order again.',
      'Nice texture and presentation.',
      'A bit bland, but still okay.',
      'Perfectly cooked and seasoned.',
      'Not my favorite, but okay for the price.'
    ];

    let inserted = 0;

    // Insert 3 reviews per item, rotating reviewers and comments
    for (let i = 0; i < items.length; i++) {
      const dish = items[i];
      for (let j = 0; j < 3; j++) {
        const reviewer = reviewers[(i + j) % reviewers.length];

        // Skip if reviewer already reviewed this dish
        const [existing] = await db.query('SELECT id FROM reviews WHERE dish_id = ? AND user_name = ?', [dish.id, reviewer.email]);
        if (existing && existing.length > 0) {
          console.log(`Skipping existing review by ${reviewer.email} for dish ${dish.id}`);
          continue;
        }

        const rating = ((i + j) % 5) + 1; // 1..5
        const comment = comments[(i + j) % comments.length];

        try {
          await db.query('INSERT INTO reviews (dish_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
            [dish.id, reviewer.email, rating, comment]);
          inserted++;
          console.log(`Inserted review for dish ${dish.id} by ${reviewer.email} (rating ${rating})`);
        } catch (err) {
          console.error(`Failed inserting review for dish ${dish.id}:`, err.message);
        }
      }
    }

    // Recompute averages for all dishes
    console.log('Recomputing averaged ratings for all dishes...');
    for (const dish of items) {
      try {
        const [ratingResult] = await db.query('SELECT AVG(rating) as avgRating FROM reviews WHERE dish_id = ?', [dish.id]);
        const avg = ratingResult && ratingResult[0] && ratingResult[0].avgRating ? ratingResult[0].avgRating : 0.0;
        await db.query('UPDATE menu_items SET rating = ? WHERE id = ?', [avg, dish.id]);
        console.log(`Updated dish ${dish.id} avg rating to ${avg}`);
      } catch (err) {
        console.error(`Failed updating rating for dish ${dish.id}:`, err.message);
      }
    }

    console.log(`Done. Inserted ${inserted} reviews.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding reviews error:', err.message);
    process.exit(1);
  }
}

seedReviewsAll();
