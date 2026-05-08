# SIA-Project — Presentation Script (Word-for-word)

Duration: ~8 minutes presentation + 2 minutes Q&A
Team: [Your Team Name]
Presenters: [Name 1], [Name 2], [Name 3], [Name 4]

Replace bracketed placeholders with real names before presenting.

---

## Presenter 1 — Intro & Problem (30–45s)

(Opening — live demo, no slides)

"Hello — we are Team [Your Team Name]. I'm [Name 1], and with me are [Name 2], [Name 3], and [Name 4]. Today we present SIA-Project, a compact online food-ordering system built for small restaurants.

Many small restaurants lack an easy-to-deploy system to accept online orders, gather customer feedback, and manage deliveries. SIA-Project addresses that gap by providing a simple, extensible stack: a React + Vite frontend, a Node.js + Express backend, and a MySQL database."


## Presenter 1 — Key features (15s)

(Features)

"Key features include: browsing a menu, adding items to cart and placing orders, user authentication and profiles, submitting reviews (which update dish ratings), an admin order view, and rider management."

---

## Presenter 2 — User demo & flow (2:00)

(Live demo / User flow)

"I'll demonstrate the main user flow in the app. I will open the app at `http://localhost:5173`.

First, I browse the menu and click a dish to open details. (pause to open FoodDetails)

Next, I select a quantity and click 'Add to cart'. Then I open the cart sidebar and proceed to Checkout.

If not signed in, I sign up or log in. For a seeded demo account you can use sample credentials from the seed data. After signing in, I confirm the address and payment method, then click 'Place Order'. (pause to place order)

When the order completes, it is recorded in the backend. For verification, the admin view or `GET /api/orders` will show the new order. Finally, I submit a review for the dish from the item details; the UI clears the input and the dish rating is updated on the next menu fetch."

Notes while demoing:
- Narrate each click and wait briefly for pages to update.
- If the site is not running locally, show recorded screenshots or the deployed demo instead.

---

## Presenter 3 — Architecture & Backend (1:15)

(Architecture — backend internals)

"Technical stack: frontend in `frontend/` (React + Vite), backend in `backend/` (Node.js + Express), and MySQL for persistent storage. The backend listens on port `5000` by default and exposes REST endpoints under `/api`.

Important endpoints to mention:
- `GET /api/menu` — returns menu items with embedded `reviews` arrays.
- `POST /api/orders` — place an order (server stores items as JSON).
- `POST /api/reviews` — insert a review; after insert the server recalculates the dish average with `SELECT AVG(rating)` and updates `menu_items.rating`.
- `POST /api/login` and `POST /api/signup` — authentication endpoints used by the frontend.

This separation keeps UI concerns in React and business logic/data in the Express API, which makes the system easy to extend or containerize."

---

## Presenter 4 — Data, Admin & Operational Details (1:00)

(Data & admin)

"We provide seeding scripts to get a demo environment quickly: `node seed.js` to populate `menu_items`, and `node seed_system.js` to insert sample users, orders, and reviews and to recompute averages.

Admin capabilities include viewing orders (joined with user data) and replying to reviews using `PUT /api/reviews/:id/reply`. Rider records can be added and their status updated using the riders endpoints. These features make it easy to manage operations during demonstrations or small pilot deployments."

---

## Presenter 4 — Security & Future Work (45s)

(Future work)

"Planned improvements for production readiness:
1. Hash passwords (bcrypt) and implement JWT-based authentication.
2. Integrate a payment gateway for real payments.
3. Add automated tests and CI to catch regressions.
4. Containerize with Docker and provide a `docker-compose.yml` for local production-like runs.
5. Harden CORS, add rate limiting, structured logging and monitoring.

These changes will make the system secure, auditable, and easy to operate at scale."

---

## Closing & Call to Action — Presenter 1 (20s)

(Closing)

"Thank you for your time. SIA-Project provides a compact, extensible base for online ordering tailored to small restaurants. If you'd like, we can deploy a demo instance or walk through adding features like in-app payments or delivery zones. We'll take your questions now." 

---

## Q&A role assignments (keep this section handy during questions)

- Presenter 1: product / overview questions
- Presenter 2: UI / demo / user flow questions
- Presenter 3: backend / API / data questions
- Presenter 4: deployment / seeding / future work questions

---

## Run/demo instructions (local dev)

```powershell
# Backend (Terminal 1)
cd backend
npm install
# create .env in backend/ per docs/development.md
node seed.js
node seed_system.js
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# Open the app in the browser:
http://localhost:5173
```

---

## Presenter notes

- Keep each section concise to match timing.
- One person should control the demo machine; the others narrate complementary points.
- Replace placeholders for team name and presenter names.

---

If you want this as a ready-to-upload DOCX for Google Docs, I can convert it and add the `.docx` to the `docs/` folder.
