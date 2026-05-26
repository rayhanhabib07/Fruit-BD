# 🍎 FruitBD — Seasonal Fruit Selling Platform

A full-stack e-commerce website for selling seasonal fruits in Bangladesh.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React + TypeScript + Tailwind CSS v4 |
| Backend    | Node.js + Express + TypeScript      |
| Database   | PostgreSQL (raw SQL, pg driver)     |
| Auth       | JWT (jsonwebtoken + bcryptjs)       |
| Images     | Cloudinary                          |
| Payment    | Stripe / Cash on Delivery           |
| State      | Zustand (cart + auth)               |
| Data Fetch | TanStack Query (React Query)        |

---

## Project Structure

```
fruitbd/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, migration
│   │   ├── middleware/       # auth, validate, upload, errorHandler
│   │   ├── modules/
│   │   │   ├── auth/        # register, login, profile
│   │   │   ├── products/    # CRUD + image upload
│   │   │   ├── orders/      # place, track, manage
│   │   │   ├── categories/  # fruit categories
│   │   │   ├── admin/       # dashboard stats, user mgmt
│   │   │   └── payments/    # Stripe integration
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # response helpers, JWT utils
│   │   └── index.ts         # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/      # Navbar, Footer, MainLayout, AdminLayout
    │   │   └── ui/          # ProductCard
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── ProductsPage.tsx
    │   │   ├── ProductDetailPage.tsx
    │   │   ├── CartPage.tsx
    │   │   ├── CheckoutPage.tsx
    │   │   ├── OrdersPage.tsx
    │   │   ├── AuthPages.tsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.tsx
    │   │       ├── AdminProducts.tsx
    │   │       └── AdminOrders.tsx
    │   ├── store/           # Zustand: authStore, cartStore
    │   ├── lib/             # Axios API client
    │   └── types/           # Shared TypeScript types
    └── package.json
```

---

## Setup

### 1. PostgreSQL Database

```bash
createdb fruitbd
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run db:migrate       # Creates tables + seeds admin + categories
npm run dev              # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:3000
```

---

## Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fruitbd
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary (for product images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

FRONTEND_URL=http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Auth     |
|--------|-----------------------|----------|
| POST   | /api/auth/register    | Public   |
| POST   | /api/auth/login       | Public   |
| GET    | /api/auth/profile     | Customer |
| PATCH  | /api/auth/profile     | Customer |

### Products
| Method | Endpoint              | Auth     |
|--------|-----------------------|----------|
| GET    | /api/products         | Public   |
| GET    | /api/products/featured| Public   |
| GET    | /api/products/:id     | Public   |
| POST   | /api/products         | Admin    |
| PATCH  | /api/products/:id     | Admin    |
| DELETE | /api/products/:id     | Admin    |

### Orders
| Method | Endpoint                  | Auth     |
|--------|---------------------------|----------|
| POST   | /api/orders               | Customer |
| GET    | /api/orders/my-orders     | Customer |
| GET    | /api/orders/:id           | Customer |
| GET    | /api/orders               | Admin    |
| PATCH  | /api/orders/:id/status    | Admin    |

### Categories
| Method | Endpoint          | Auth   |
|--------|-------------------|--------|
| GET    | /api/categories   | Public |
| POST   | /api/categories   | Admin  |
| PATCH  | /api/categories/:id| Admin |

### Admin
| Method | Endpoint              | Auth  |
|--------|-----------------------|-------|
| GET    | /api/admin/dashboard  | Admin |
| GET    | /api/admin/users      | Admin |
| PATCH  | /api/admin/users/:id/role | Admin |
| GET    | /api/admin/inventory  | Admin |

---

## Features Implemented

### Customer
- [x] Browse all fruits with search, filter by season/category/price
- [x] View single product with description, stock, price/kg
- [x] Shopping cart (add, remove, update qty) — persisted in localStorage
- [x] Checkout with delivery address + payment method selection
- [x] Order placement (stock validation, atomic transactions)
- [x] Order tracking with visual progress bar
- [x] User registration and login

### Admin
- [x] Dashboard with stats: orders, revenue, products, customers
- [x] Recent orders and low-stock alerts
- [x] Product management: create/edit/delete with Cloudinary image upload
- [x] Order management: view all, filter by status, update status inline
- [x] Orders by status breakdown

### Backend
- [x] JWT authentication with role-based access control
- [x] Strict TypeScript (zero `any` types)
- [x] Raw SQL only (no ORM)
- [x] Standardized success/error response format
- [x] Atomic order creation with stock deduction
- [x] Cloudinary image upload/delete
- [x] Stripe payment intent creation + webhook handler
- [x] Input validation with express-validator
- [x] Pagination on products and orders

---

## Default Admin Account
After running migrations:
- **Email:** admin@fruitbd.com  
- **Password:** Admin@123

---

## Database Schema

```sql
categories  (id, name, slug, description, created_at)
users       (id, name, email, password, role, address, phone, created_at, updated_at)
products    (id, name, description, price_per_kg, season, category_id, stock_kg, image_url, cloudinary_public_id, is_available, created_at, updated_at)
orders      (id, user_id, total_amount, status, delivery_address, delivery_phone, payment_method, payment_status, payment_id, notes, created_at, updated_at)
order_items (id, order_id, product_id, quantity_kg, price_per_kg, subtotal[generated])
```
