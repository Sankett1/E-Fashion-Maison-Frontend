# E-Fashion MAISON — Frontend

A luxury fashion e-commerce frontend built with React + Vite.

## Quick Start

```bash
npm install
cp .env.example .env   # or use the included .env
npm run dev            # → http://localhost:5173
```

## Pages & Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Home (Hero) | No |
| `/shop` | Shop / Browse | No |
| `/shop/:id` | Product Detail | No |
| `/cart` | Shopping Cart | No |
| `/checkout` | Checkout | Yes |
| `/account` | My Account | Yes |
| `/wishlist` | Wishlist | Yes |
| `/about` | About MAISON | No |
| `/contact` | Contact Us | No |
| `/gift-cards` | Gift Cards | No |
| `/size-guide` | Size Guide | No |
| `/returns` | Returns & Exchanges | No |
| `/admin` | Admin Dashboard | Admin only |
| `/admin/products` | Manage Products | Admin only |
| `/admin/orders` | Manage Orders | Admin only |
| `/admin/customers` | Manage Customers | Admin only |
| `/admin/analytics` | Analytics | Admin only |
| `/admin/settings` | Settings | Admin only |

## Making a User an Admin

1. Register a new account via the website
2. In MongoDB, find the user document and set `"role": "admin"`
3. Log out and log back in — the Admin Panel link will appear in the navbar

## Tech Stack

- React 19 + Vite
- React Router v7
- Axios for API calls
- Heroicons
- Tailwind CSS (utility classes)
- Context API for Auth + Cart state
