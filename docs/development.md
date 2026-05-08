# Development & Running

This document provides step-by-step development and runtime instructions for running the frontend and backend locally, environment variables, and seeding the database with sample data.

## Prerequisites

- Node.js (v18+ recommended) and npm
- MySQL server (local or remote)
- A terminal (PowerShell on Windows preferred here)

## Environment variables (backend)

Create a `.env` file inside the `backend/` folder with these variables (example):

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_db_password
DB_NAME=sia_ordering
PORT=5000
```

Adjust values to match your local MySQL user and database.

## Create Database

From a MySQL console or client:

```sql
CREATE DATABASE sia_ordering CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sia_ordering;
-- Run the DDL in docs/database.md if your tables are not present
```

## Install & Run (recommended flow)

1. Backend (terminal A)

```powershell
cd backend
npm install
# ensure .env is present and DB is accessible
node seed.js         # seed empty menu_items
node seed_system.js  # seed users, orders, reviews and update averages
npm run dev          # start with nodemon, or use `node server.js`
```

2. Frontend (terminal B)

```powershell
cd frontend
npm install
npm run dev
```

Open the app at the Vite dev URL (usually http://localhost:5173). API calls go to http://localhost:5000 by default.

## Seeding notes

- `backend/seed.js` populates `menu_items` with sample dishes (rating set to 0.0).
- `backend/seed_system.js` inserts sample users, orders and reviews, then recalculates `menu_items.rating` as the AVG of existing reviews.
- `backend/add_extra_reviews.js` and similar helper scripts exist for generating additional data.

## Common issues & fixes

- DB connection refused: verify `.env` credentials and that MySQL is listening on the host/port.
- CORS errors: ensure backend `app.use(cors())` is active and frontend is calling the correct backend URL.
- Port collisions: change `PORT` in `.env` or Vite dev port.
