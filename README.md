# SIA-Project — Online Ordering System

Comprehensive documentation for the SIA online ordering system (frontend + backend). This repository contains a React + Vite frontend and a Node.js + Express backend with a MySQL database.

## Table of Contents
- **Overview**: Quick summary and architecture
- **Quickstart**: Run locally (dev) instructions
- **Environment**: Required environment variables
- **Seeding**: How to populate sample data
- **API Reference**: Endpoints and examples ([docs/api.md](docs/api.md))
- **Database Schema**: Tables and SQL ([docs/database.md](docs/database.md))
- **Backend Details**: server structure, scripts ([docs/backend.md](docs/backend.md))
- **Frontend Details**: app structure and flows ([docs/frontend.md](docs/frontend.md))
- **Development & Deployment**: build, deploy, troubleshooting ([docs/development.md](docs/development.md))

---

## Overview

This project implements a small online food ordering system with:

- Frontend: React (Vite) app in the `frontend/` folder.
- Backend: Express server in the `backend/` folder, using MySQL via `mysql2/promise`.
- Seed scripts to populate sample menu items, users, orders and reviews.

High-level flow:

1. Frontend fetches menu and reviews from the backend (`GET /api/menu`).
2. Authenticated users can submit reviews (`POST /api/reviews`).
3. Backend stores reviews and updates the average rating on `menu_items.rating`.

---

## Quickstart (development)

Open two terminals (PowerShell) and run the frontend and backend separately.

Terminal 1 — Backend

```powershell
cd backend
npm install
# create a .env file (see docs/development.md)
node server.js
# or with auto-reload:
npm run dev
```

Terminal 2 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

By default the backend runs on port `5000` (env `PORT`) and the frontend Vite dev server runs on port `5173`.

---

## Where to look next

- Backend entrypoint: [backend/server.js](backend/server.js)
- DB connection: [backend/db.js](backend/db.js)
- Frontend entrypoint: [frontend/src/main.jsx](frontend/src/main.jsx)
- Menu and review flow: [frontend/src/context/MenuContext.jsx](frontend/src/context/MenuContext.jsx) and [frontend/src/components/FoodDetailsModal.jsx](frontend/src/components/FoodDetailsModal.jsx)

Full developer docs are in the `docs/` folder:

- [docs/development.md](docs/development.md)
- [docs/backend.md](docs/backend.md)
- [docs/frontend.md](docs/frontend.md)
- [docs/api.md](docs/api.md)
- [docs/database.md](docs/database.md)

---

If you want, I can also commit these files to git and restart the backend for you. Do you want that? 
