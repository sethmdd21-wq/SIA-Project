# Database Schema

This document contains the expected table definitions used by the application and example SQL DDL you can run to create them.

> Note: The seed scripts (`backend/seed.js`, `backend/seed_system.js`) will insert sample data but assume the tables already exist. If tables are missing run the SQL below.

## Suggested DDL

```sql
-- menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  img TEXT,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dish_id INT NOT NULL,
  user_name VARCHAR(255),
  rating INT NOT NULL,
  comment TEXT,
  reply TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dish_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  isAdmin TINYINT(1) DEFAULT 0
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_email VARCHAR(255),
  items JSON,
  total DECIMAL(10,2),
  type VARCHAR(50),
  status VARCHAR(50),
  paymentMethod VARCHAR(50),
  paymentStatus VARCHAR(50),
  riderId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- riders
CREATE TABLE IF NOT EXISTS riders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  vehicle VARCHAR(100),
  plate VARCHAR(50),
  model VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Available'
);
```

## Notes about schema

- `menu_items.rating`: stored as a decimal and kept in sync by the backend. After inserting reviews the server recomputes the average using `AVG(rating)` and writes the value into `menu_items.rating`.
- `orders.items` is stored as JSON in the DB; the app stores item id, name, price and quantity in that JSON string.
- Passwords in the seed data are plaintext for convenience — replace with hashed passwords in production.

If you want to print the table schema quickly, the repository includes `backend/check_schema.js` and `backend/check_full_schema.js` which call `DESCRIBE <table>` and log the result.
