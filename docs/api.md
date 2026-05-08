# API Reference

Base URL (development): `http://localhost:5000/api`

All endpoints use JSON payloads and return JSON responses.

---

## Auth

- POST `/api/login`
  - Body: `{ "email": "...", "password": "..." }`
  - Success: user object (no password returned)

- POST `/api/signup`
  - Body: `{ "name", "email", "password", "phone", "address" }`
  - Success: created user object

## Users

- GET `/api/users/:email`
  - Returns user profile (id, name, email, phone, address, isAdmin)

- PUT `/api/users/:email`
  - Body: `{ name, phone, address }` — updates profile

- DELETE `/api/users/:email`
  - Deletes account

## Menu

- GET `/api/menu`
  - Returns all menu items with attached `reviews` array for each item.

- POST `/api/menu`
  - Body: `{ name, price, category, img, description }` — adds a menu item

- PUT `/api/menu/:id`
  - Body: `{ name, price, category, img, description }` — update

- DELETE `/api/menu/:id`
  - Removes a menu item

## Orders

- GET `/api/orders`
  - Admin: Returns all orders with user details joined into the result.

- POST `/api/orders`
  - Body: `{ id, user, items, total, type, paymentMethod, paymentStatus }` — creates order

- PUT `/api/orders/:id`
  - Body may include `{ status, riderId, paymentStatus }` — updates order status

## Riders

- GET `/api/riders`
  - Returns riders list

- POST `/api/riders`
  - Body: `{ name, phone, vehicle, plate, model }` — adds a rider (returns object with `status: 'Available'`)

- PUT `/api/riders/:id`
  - Body: `{ status }` — update rider status

## Reviews

- POST `/api/reviews`
  - Body: `{ dish_id, user_name, rating, comment }`
  - Behavior: Inserts review, then backend recalculates `menu_items.rating` = AVG(reviews.rating) for that `dish_id`.
  - Response: inserted review id plus `avgRating` (when update succeeded) or a warning if rating update failed.

- PUT `/api/reviews/:id/reply`
  - Body: `{ reply }` — admin replies to a review

---

Examples (cURL):

```bash
# Submit a review
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"dish_id":21,"user_name":"juan@gmail.com","rating":4,"comment":"Nice!"}'
```
