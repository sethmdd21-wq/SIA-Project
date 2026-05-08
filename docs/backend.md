# Backend (Express) — Design & Notes

This document explains the backend implementation, important files, scripts, and behavior particularities.

## Entry point

- `backend/server.js`: Express server, routes and API handlers. The server uses `mysql2/promise` via `backend/db.js`.

## DB connection

- `backend/db.js` creates a pooled MySQL connection using environment variables `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`.

## Important scripts

- `npm run dev` — runs `nodemon server.js` for auto-reloading during development.
- `node server.js` — start server directly.
- `node seed.js` — seed `menu_items`.
- `node seed_system.js` — seed users, orders, reviews and recalc averages.

## Review flow

- The frontend submits new reviews to `POST /api/reviews` with payload `{ dish_id, user_name, rating, comment }`.
- After inserting the review, the server recalculates the dish's average rating and updates `menu_items.rating`. This ensures the UI shows the updated average immediately after the review is saved.

If you ever need to recompute all dish averages (for example after bulk imports), use the logic in `backend/add_extra_reviews.js` which iterates dishes and updates the AVG for each.

## Logs & debugging

- The server prints basic messages for login attempts and seed actions. For deeper debugging, add `console.log` near failing SQL queries and run the failing SQL directly in a MySQL client.

## Security notes

- Passwords are stored in plaintext in the seed data — for a production-ready system replace this with hashed passwords (bcrypt or scrypt) and proper user authentication flows (JWT, sessions).
- There is minimal auth/authorization logic — admin detection is a simple `isAdmin` flag. Protect admin endpoints before deploying to production.
