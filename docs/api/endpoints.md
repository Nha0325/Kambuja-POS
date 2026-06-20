# API Endpoints

Base URL: `http://localhost:8080/api`

## Authentication

- `POST /auth/login`
- `POST /auth/logout`

## ADMIN_MANAGER

- `GET /admin-manager/dashboard`
- `GET /admin-manager/admins`
- `POST /admin-manager/admins`
- `GET /admin-manager/reports/sales`
- `GET /admin-manager/reports/stock`
- `GET /admin-manager/settings`
- `POST /admin-manager/settings`
- `GET /shops`
- `POST /shops`
- `GET /shops/{id}`
- `PUT /shops/{id}`
- `GET /notifications`
- `PATCH /notifications/{id}/read`

## ADMIN

- `GET /admin/dashboard`
- `GET /admin/shop`
- `PUT /admin/shop`
- `POST /admin/cashiers`
- `GET /cashiers`
- `GET|POST|PUT|DELETE /categories`
- `GET|POST|PUT|DELETE /products`
- `GET|POST|DELETE /product-codes`
- `GET|PUT /inventory`
- `GET|POST /stock-movements`
- `GET /reports/dashboard`
- `GET /reports/sales`
- `GET|POST|PUT|DELETE /customers`
- `GET|PUT /settings`
- `GET|PUT /telegram/settings`
- `POST /telegram/test`
- `GET /notifications`
- `PATCH /notifications/{id}/read`
- `GET /audit-logs`

## ADMIN and CASHIER

- `GET /products`
- `GET /products/{id}`
- `GET /product-codes/lookup/{code}`
- `GET /product-codes/product/{productId}`
- `GET /inventory`
- `GET /inventory/low-stock`
- `GET /inventory/product/{productId}`
- `POST /sales`
- `GET /sales`
- `GET /sales/{id}`
- `POST /payments`
- `GET /payments/sale/{saleId}`
- `POST /receipts/sale/{saleId}`
- `GET /receipts/sale/{saleId}`
- `GET|POST|PUT /customers`

Protected requests require:

```http
Authorization: Bearer <token>
```

Swagger UI: `http://localhost:8080/swagger-ui.html`.

The Telegram settings request contains only `chatId` and `enabled`. The bot token is read exclusively from `TELEGRAM_BOT_TOKEN`.
