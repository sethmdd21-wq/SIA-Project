# Frontend (React + Vite) — Structure & Notes

This document explains the frontend structure, key components, data flow and points of extension.

## Project structure (high level)

- `frontend/src/`
  - `main.jsx` — app entry
  - `App.jsx` — root layout and routes
  - `components/` — UI components (Navbar, Footer, FoodDetailsModal, CartSidebar, etc.)
  - `context/` — React contexts for `AuthContext`, `MenuContext`, `CartContext`, `OrderContext`
  - `pages/` — route pages (Home, Menu, Checkout, Profile, AdminDashboard)

## Key flows

- Menu & reviews: The `MenuContext` (`frontend/src/context/MenuContext.jsx`) loads menu items from `GET /api/menu`. It exposes `addReview()` which posts to `POST /api/reviews` and refreshes the menu list.
- Review UI: `FoodDetailsModal.jsx` shows the dish details, existing reviews and the star-rating input. When a user submits a rating the modal calls `addReview()` and the menu is refetched so the updated average rating is displayed.

## Scripts

- `npm run dev` — start Vite dev server.
- `npm run build` — build production assets.
- `npm run preview` — preview the production build locally.

## Notes for contributors

- `MenuContext` is the single source of truth for menu data. If you need to change how ratings are aggregated client-side, start here.
- Keep components small and stateless where possible; prefer contexts/hooks for async data.
