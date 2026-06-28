# Kambuja POS

## Overview
Kambuja POS is a comprehensive Point of Sale (POS) and Inventory Management platform designed specifically to streamline the daily operations of small retail shops, convenience stores, and mini markets.

## Project Purpose & Business Use Case
The primary goal of Kambuja POS is to empower small and medium-sized businesses with a robust, digital ecosystem to manage their retail flow. By replacing traditional ledger books and disjointed software, Kambuja POS provides an all-in-one centralized system. 

Store owners can effortlessly track real-time stock levels, monitor daily sales, manage supplier relationships, and handle purchasing directly from suppliers. Meanwhile, staff can rely on a fast, responsive POS screen to check out customers seamlessly. The system eliminates stock-outs via automated low-stock alerts and ensures business transparency through detailed reporting and system auditing logs.

## Role-Based Access
Kambuja POS operates on a strict multi-tier role-based access control system to ensure data security and operational hierarchy:

- **Admin Manager:** The highest level of access. This role is responsible for the overall platform administration, monitoring system health, reviewing system logs, and managing shop subscriptions across the entire platform.
- **Admin:** The shop owner or store manager. Admins have full control over their specific shop's operations. They manage the product catalog, oversee inventory and stock movements, handle supplier and customer data, analyze sales reports, and create cashier accounts.
- **Cashier:** The frontline retail staff. Cashiers have restricted access focused purely on customer transactions. They operate the POS interface, process sales, search for products via barcode/QR code, and generate receipts or invoices.

## Main Modules & Features
- **Point of Sale (POS):** Fast, responsive checkout interface tailored for cashiers.
- **Inventory Management:** Full product and category tracking with barcode/QR lookup support.
- **Stock Control:** Dedicated stock-in/movement tracking and automated low stock alerts.
- **Sales & Purchasing:** Comprehensive workflows for managing customer sales and supplier purchases.
- **Reporting & Analytics:** Financial insights, daily sales reports, and general business metrics.
- **System Auditing:** Detailed system logs tracking user actions and critical business events.
- **Notification System:** Built-in alerts (with Telegram service integration support) for immediate business updates.

## Tech Stack
Kambuja POS is built using a modern, scalable JavaScript stack:
- **Frontend:** React, Vite, Tailwind CSS (Single Page Application architecture)
- **Backend:** Node.js, Express (RESTful API architecture)
- **Database:** MongoDB (NoSQL document storage)

## Security & Git Safety Notes
- **Environment Variables:** This project relies on `.env` files for configuration. Do **not** commit real secrets, API keys, or database URIs to version control. Always use the `.env.example` templates provided.
- **Tracking:** Keep your `.env`, `Frontend/.env`, and `Backend/.env` files out of Git tracking. Ensure that `package-lock.json` remains tracked for dependency consistency.

## Local LAN Testing & Mobile Scanning
When testing the POS application on a mobile device over a local Wi-Fi network (LAN IP like `10.91.x.x`):
- Phone browser camera does not work reliably on `http://LAN_IP` because `getUserMedia` requires a secure context.
- Use HTTPS domain/tunnel for correct testing.
- Example correct URLs:
  - `https://pos.kambujapos.com/cashier/pos`
  - `https://api.kambujapos.com/api/v1`

**Quick test workaround for Brave/Chrome:**
1. Open `brave://flags` or `chrome://flags`
2. Search for "Insecure origins treated as secure"
3. Add your local IP with port (e.g., `http://10.91.21.48:5174`)
4. Enable and relaunch the browser

**Hardware Scanners**: Standard USB/Bluetooth barcode scanners operating in keyboard-emulation mode will continue to work perfectly fine regardless of HTTPS.
# 🏪 Kambuja POS — Full Project Overview

## 📌 Project Summary

**Kambuja POS** ជា platform សម្រាប់គ្រប់គ្រង Point of Sale (POS) និង Inventory Management របស់ shop តូចៗ / mini market។

- **Type**: Full-stack Web Application (Monorepo)
- **Architecture**: SPA Frontend + RESTful API Backend
- **Multi-tenant**: Shop isolation via `shopId` on every data model

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| **Backend** | Node.js 20, Express 5 |
| **Database** | MongoDB (Mongoose 9) |
| **Auth** | JWT (Bearer token + cookie fallback) |
| **Deploy Frontend** | Vercel (SPA rewrites) |
| **Deploy Backend** | Railway (Railpack builder) |
| **CI/CD** | GitHub Actions (`ci.yml` + `cd.yml`) |

---

## 👥 Role-Based Access Control (3 Roles)

| Role | Access Level | shopId |
|------|-------------|--------|
| **ADMIN_MANAGER** | Platform-wide: all shops, logs, subscriptions, system health | `null` (no shop) |
| **ADMIN** | One shop: products, inventory, stock, sales, purchases, reports, cashier management | Required |
| **CASHIER** | One shop: POS checkout, scan, receipts, held bills, daily close | Required |

### Auth Flow
1. Login → JWT token stored in **localStorage** (Bearer token)
2. Every API call → `Authorization: Bearer <token>`
3. Backend `authGuard` → verify JWT → load user → attach `req.user`
4. `role.guard.js` (`allowRoles()`) → check role permission
5. `shop-scope.guard.js` → inject `req.shopFilter` (ADMIN_MANAGER sees all, others see own shop)

---

## 📁 Project Structure

```
Kambuja-POS/
├── Backend/                   # Express API Server
│   ├── server.js              # Entry point (connect DB → listen)
│   ├── app.js                 # Express app (middleware + routes)
│   ├── config/env.js          # dotenv + env defaults
│   ├── database/
│   │   ├── db.js              # MongoDB connection
│   │   ├── seeder.js          # Super admin bootstrap
│   │   └── migrate-three-roles.js
│   ├── models/ (26 models)
│   ├── controller/ (28 controllers)
│   ├── routes/ (27 routes)
│   ├── guards/ (4 guards)
│   ├── helper/ (10 helpers)
│   ├── services/ (2 services)
│   └── constants/
│
├── Frontend/                  # React SPA
│   ├── src/
│   │   ├── App.jsx            # BrowserRouter + Auth redirect
│   │   ├── routes/            # Role-based routing
│   │   ├── layouts/           # 4 layouts (Admin, AdminManager, Cashier, Auth)
│   │   ├── pages/             # All page components
│   │   ├── components/        # Shared UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Axios API service layers
│   │   ├── utils/             # Helpers (format, role, etc)
│   │   └── i18n/              # Translation support
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .github/workflows/         # CI/CD
│   ├── ci.yml                 # Lint + build check
│   └── cd.yml                 # Deployment pipeline
│
├── vercel.json                # Frontend deployment config
├── railway.toml               # Backend deployment config
└── package.json               # Root (Railway build scripts)
```

---

## 🗄️ Database Models (26 Models)

### Core Business
| Model | Purpose |
|-------|---------|
| **User** | Users (username, email, password, role, shopId, status) |
| **Shop** | Shops (name, code, owner, subscription, address, limits) |
| **Product** | Products (name, code, barcode, sku, prices, stock, shopId) |
| **Category** | Product categories |
| **Supplier** | Product suppliers |
| **Customer** | Shop customers |

### Transactions
| Model | Purpose |
|-------|---------|
| **Sale** | Sale transactions (items, totals, payment status) |
| **Purchase** | Supplier purchases |
| **Payment** | Payment records |
| **Receipt** | Receipt metadata |
| **HeldBill** | Paused/saved bills (POS) |
| **DailyClose** | End-of-day cash reconciliation |

### Inventory
| Model | Purpose |
|-------|---------|
| **Inventory** | Inventory log entries |
| **StockMovement** | Stock movement tracking (RECEIVE, SALE, ADJUST) |
| **ProductCode** | Barcode/QR code records |
| **Unit** | Unit of measurement |
| **UnitConversionTemplate** | Unit conversion templates |

### System
| Model | Purpose |
|-------|---------|
| **AuditLog** | User action audit trail |
| **SystemLog** | Backend system events |
| **Alert** | System alerts (low stock, security) |
| **Notification** | User notifications |
| **NotificationChannel** | Notification delivery channels |
| **NotificationLog** | Notification delivery log |
| **Location** | Shop locations/branches |
| **Subscription** | Shop subscription tracking |
| **Counter** | Auto-increment counters (invoice numbers) |

---

## 🔌 Backend API Routes (27 Routes)

All routes prefixed with `/api/v1/`:

| Route | Guard | Description |
|-------|-------|-------------|
| `/auth` | Public | signin, signup, signout, /me |
| `/products` | authGuard | CRUD + barcode search |
| `/categories` | authGuard | CRUD categories |
| `/suppliers` | authGuard | CRUD suppliers |
| `/customers` | authGuard | CRUD customers |
| `/sales` | authGuard | Create sale, list, payment |
| `/purchases` | authGuard | Create purchase, status, payment |
| `/inventory` + `/stock` | authGuard | Stock overview, receive, adjust |
| `/stock-movements` | authGuard | Movement history |
| `/report` | authGuard | Sales report, stock report, general |
| `/users` | authGuard | Manage cashiers |
| `/admin-manager` | authGuard | Platform management (shops, users, logs) |
| `/shops` | authGuard | Shop details |
| `/locations` | authGuard | Shop locations |
| `/product-codes` | authGuard | Barcode/QR management |
| `/payments` | authGuard | Payment records |
| `/receipts` | authGuard | Receipt management |
| `/notifications` | authGuard | Notification management |
| `/alerts` | authGuard | Alert management |
| `/pos` | authGuard | POS-specific operations |
| `/held-bills` | authGuard | Bill hold/resume |
| `/daily-close` | authGuard | Daily closing |
| `/units` | authGuard | Unit management |
| `/unit-templates` | authGuard | Unit conversion templates |
| `/upload` | authGuard | File upload (multer) |
| `/system-logs` | Public* | System logs |

---

## 🖥️ Frontend Pages

### Admin Pages (Shop Owner)
- **Dashboard** — Sales overview, charts, metrics
- **Products** — ProductList, ProductCreate, ProductEdit, PrintLabel
- **Categories** — Category CRUD
- **Suppliers** — Supplier CRUD
- **Inventory** — Inventory overview, StockIn, StockAdjustment, History
- **Purchases** — PurchaseList, PurchaseCreate, Payment/Status modals
- **Reports** — SaleReport, StockReport
- **Users** — Manage cashier accounts
- **Settings** — Shop settings
- **Notifications** — Alert management

### Admin Manager Pages (Platform Admin)
- **Dashboard** — Platform-wide metrics
- **Shops** — Manage all shops
- **Admins** — Manage admin accounts
- **Products** — Read-only product view across shops
- **Stock** — Read-only stock overview
- **Reports** — Platform reports
- **Alerts** — System alerts
- **Logs** — System activity logs
- **Health** — System health monitoring
- **Settings** — Platform settings
- **Subscriptions** — Shop subscription management
- **Locations** — Location management
- **Access** — Access control

### Cashier Pages
- **POS** — Point of sale checkout (scan, search, cart)
- **Sales History** — View past sales
- **Today's Sales** — Current day sales
- **Held Bills** — Pause/resume bills
- **Daily Close** — End of day closing
- **Receipts** — Receipt lookup
- **Stock Check/Lookup** — Check product availability

### Auth Pages
- **Signin** — Login page (all roles)

---

## 🔐 Security Features

1. **Helmet** — HTTP security headers
2. **Rate Limiting** — 1000 requests / 15 min per IP
3. **CORS** — Whitelist-based origin control
4. **Mongo Sanitize** — NoSQL injection prevention
5. **JWT** — Token-based authentication (Bearer header)
6. **Role Guards** — Role-based route protection
7. **Shop Scope** — Data isolation per shop
8. **Password Hashing** — bcryptjs

---

## 🚀 Deployment Setup

### Frontend → Vercel
- Framework: Vite
- SPA rewrites: `/(.*) → /index.html`
- Env: `VITE_BASE_URL` points to Railway backend

### Backend → Railway
- Builder: Railpack
- Build: `cd Backend && npm ci`
- Start: `cd Backend && npm run seed && npm start`
- Seeds super admin on every deploy (idempotent)
- Env: `MONGODB_URI`, `JWT_SECRET`, `SUPER_*` credentials

### CI/CD → GitHub Actions
- **ci.yml**: Lint check + build validation
- **cd.yml**: Full deployment pipeline

---

## 📊 Key Design Patterns

1. **Shop Isolation**: Every business model has `shopId`. Guards inject `req.shopFilter` automatically.
2. **Simple Stock Model**: Products have `stock` + `currentStock` (synced via pre-validate hook). 1:1 quantity, no unit conversions.
3. **Dual Auth Support**: Accepts both `Authorization: Bearer` header and `cookie.token` for flexibility.
4. **Seeder Pattern**: `seeder.js` creates/updates super admin on every deploy — safe to re-run.
5. **Error Handler**: Centralized error handling middleware.
6. **Audit Trail**: `AuditLog` model tracks user actions.
7. **Barcode/QR**: Product lookup by barcode, SKU, or code. Camera scanning supported (HTTPS required).

---

## 📈 Current State (June 2026)

✅ **Completed Features:**
- Full 3-role auth system
- Admin product/category/supplier CRUD
- Inventory management (stock in, adjust, history)
- POS checkout with barcode/QR scan
- Sales & purchase workflows
- Sale & stock reports
- Held bills, daily close, receipts
- Admin Manager platform monitoring
- System logs & alerts
- Notification system (Telegram integration)
- Subscription management
- CI/CD pipeline (GitHub Actions → Vercel + Railway)
- Production deployed & running

⚠️ **Known Considerations:**
- Camera scan requires HTTPS (or browser flag workaround for LAN testing)
- `Unit` and `UnitConversionTemplate` models exist but unit conversion logic was simplified/removed
- Some legacy fields in Sale model (`saleUnit`, `convertedQtyBase`, etc.) remain from older architecture
