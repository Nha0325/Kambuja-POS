# API Endpoints

Base URL: `http://localhost:8080/api/v1`

## Authentication

- `POST /auth/login`
- `GET /auth/current`
- `POST /auth/logout`

## ADMIN_MANAGER

- `GET /admin-manager/dashboard`
- `GET|POST /admin-manager/shops`
- `GET|PATCH|DELETE /admin-manager/shops/:id`
- `GET|POST /admin-manager/admins`
- `GET|PATCH /admin-manager/admins/:id`
- `PATCH /admin-manager/admins/:id/status`
- `GET /admin-manager/reports`
- `GET /admin-manager/audit-logs`

## ADMIN

- `GET|PATCH /shops/me`
- category, product, supplier, purchase, and CASHIER CRUD APIs
- `GET /inventory`
- `POST /inventory/stock-in`
- `POST /inventory/adjust`
- product-code management APIs
- shop report APIs
- notification channel and log APIs

## CASHIER

- `GET /pos/scan/:code`
- `POST /sales`
- `GET /sales`
- `GET /sales/today`
- `GET /sales/:id`
- `POST /payments`
- `GET /payments/sale/:saleId`
- `GET|POST /receipts/sale/:saleId`
- `POST /receipts/sale/:saleId/print`

Protected requests use the HTTP-only login cookie. Bearer JWT authentication is also accepted.
