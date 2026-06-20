# Kambuja Flow Digital POS

Spring Boot and MongoDB backend for the Kambuja Flow B2B POS and inventory platform.

## Requirements

- Java 21 or newer
- MongoDB
- Maven wrapper included

## Run

```bash
cd apps/api
export JWT_SECRET='replace-with-a-random-secret-at-least-32-bytes-long'
export BOOTSTRAP_ADMIN_MANAGER_PASSWORD='replace-with-a-strong-password'
export TELEGRAM_BOT_TOKEN='<TELEGRAM_BOT_TOKEN>'
./mvnw spring-boot:run
```

Default development configuration:

| Variable | Default |
|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/kambuja_pos` |
| `SERVER_PORT` | `8080` |
| `MANAGEMENT_PORT` | `8081` |
| `JWT_EXPIRATION_MS` | `86400000` |
| `BOOTSTRAP_ADMIN_MANAGER_NAME` | `Platform Manager` |
| `BOOTSTRAP_ADMIN_MANAGER_EMAIL` | `manager@kambujaflow.local` |
| `BOOTSTRAP_ADMIN_MANAGER_PASSWORD` | `change-me-before-production` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://localhost:5174` |
| `TELEGRAM_BOT_TOKEN` | Required; no default |

When the `users` collection is empty, startup creates one `ADMIN_MANAGER` account from the bootstrap environment variables. Change the default password before deployment.

## Roles

- `ADMIN_MANAGER`: platform-level shop and admin management
- `ADMIN`: shop administration, products, inventory, reports, settings
- `CASHIER`: shop POS sales, payments, receipts, customer records

Customers are records in the `customers` collection and are not login users.

## Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "manager@kambujaflow.local",
  "password": "change-me-before-production"
}
```

Protected requests require:

```http
Authorization: Bearer <token>
```

Logout is stateless. Clients remove the token after `POST /api/auth/logout`.

## API prefixes

| Prefix | Purpose |
|---|---|
| `/api/auth` | Login and logout |
| `/api/admin-manager` | Platform dashboard and admin creation |
| `/api/admin` | Shop dashboard and cashier creation |
| `/api/shops` | Shop management |
| `/api/cashiers` | Cashier listing |
| `/api/categories` | Shop categories |
| `/api/products` | Shop products |
| `/api/product-codes` | Barcode, QR code, and SKU lookup |
| `/api/inventory` | Product inventory |
| `/api/stock-movements` | Stock-in, adjustment, damage, and history |
| `/api/sales` | POS sales |
| `/api/payments` | Sale payments |
| `/api/receipts` | Paid-sale receipts |
| `/api/customers` | Customer records |
| `/api/reports` | Shop dashboard and sales reports |
| `/api/telegram` | Telegram configuration and test messages |
| `/api/notifications` | Shop notifications |
| `/api/settings` | Shop settings |
| `/api/audit-logs` | Shop audit history |

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

Health and metrics:

```text
http://localhost:8081/actuator/health
http://localhost:8081/actuator/prometheus
```

## MongoDB collections

1. `users`
2. `shops`
3. `categories`
4. `products`
5. `product_codes`
6. `inventory`
7. `stock_movements`
8. `sales`
9. `payments`
10. `receipts`
11. `customers`
12. `telegram_settings`
13. `notifications`
14. `settings`
15. `audit_logs`

## Verification

```bash
cd apps/api
./mvnw test
```
