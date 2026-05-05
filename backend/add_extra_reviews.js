const db = require('./db');

const extraReviews = [
  { dish_id: 22, user_name: 'Maria Clara', rating: 5, comment: 'The sinigang is perfectly sour! Just the way I like it.', reply: null },
  { dish_id: 24, user_name: 'Juan Dela Cruz', rating: 4, comment: 'Good portion size for the pancit. Very tasty.', reply: 'We aim to satisfy! Thanks Juan.' },
  { dish_id: 26, user_name: 'Jose Rizal', rating: 5, comment: 'Best Halo-Halo in town. The ube ice cream is so creamy!', reply: null },
  { dish_id: 27, user_name: 'Seth Admin', rating: 5, comment: 'Testing the Leche Flan—quality is top notch!', reply: 'Glad the boss approves!' },
  { dish_id: 29, user_name: 'Maria Clara', rating: 4, comment: 'Kare-kare sauce is rich. Could use more bagoong though.', reply: null },
  { dish_id: 21, user_name: 'Jose Rizal', rating: 4, comment: 'Classic adobo flavor. Very nostalgic.', reply: null }
];

async function addMoreReviews() {
  try {
    console.log('--- Adding Extra Reviews ---');
    for (const r of extraReviews) {
      await db.query('INSERT INTO reviews (dish_id, user_name, rating, comment, reply) VALUES (?, ?, ?, ?, ?)',
        [r.dish_id, r.user_name, r.rating, r.comment, r.reply]);
      console.log(`Review added by ${r.user_name} for dish ${r.dish_id}`);
    }

    // Re-calculate all dish ratings
    console.log('--- Re-calculating Menu Ratings ---');
    const [dishes] = await db.query('SELECT id FROM menu_items');
    for (const dish of dishes) {
      const [ratingResult] = await db.query('SELECT AVG(rating) as avgRating FROM reviews WHERE dish_id = ?', [dish.id]);
      const avg = ratingResult[0].avgRating || 0.0;
      await db.query('UPDATE menu_items SET rating = ? WHERE id = ?', [avg, dish.id]);
    }

    console.log('--- Extra Reviews Added Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Error adding extra reviews:', err.message);
    process.exit(1);
  }
}

addMoreReviews();
