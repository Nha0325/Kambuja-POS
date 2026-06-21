# Kambuja POS — Project Memory

This file summarizes the **kambuja-pos** codebase so future AI agents can onboard quickly.

---

## 1. Project purpose

`kambuja-pos` is a **B2B point-of-sale and inventory platform** built for the Cambodian market. It supports multi-shop management, product catalogs, stock tracking, sales processing, receipt generation, and Telegram notifications.

Key roles:
- `ADMIN_MANAGER` — platform-level manager (creates shops, manages global settings)
- `ADMIN` — shop owner/admin (manages products, inventory, staff)
- `CASHIER` — shop cashier (processes sales, prints receipts)

---

## 2. Tech stack

| Layer | Technology | Version |
|---|---|---|
| Backend | Spring Boot | 4.1.0 |
| Language | Java | 21 |
| Database | MongoDB | (local/cloud) |
| Auth | Spring Security + JWT (jjwt 0.13.0) |
| Docs | SpringDoc OpenAPI | 3.0.0 |
| Monitoring | Spring Boot Actuator + Prometheus |
| Frontend (Admin) | React + Vite + TailwindCSS | React 19.2.7, Tailwind 4.3.1, Vite 8.0.16 |
| Frontend (Manager) | React + Vite + TailwindCSS | same versions |
| State | Zustand | 5.0.14 |
| HTTP client | Axios | 1.18.0 |
| Build | Maven (api), npm (frontends) |

---

## 3. Frontend structure

Two independent React SPAs in `apps/`:

### `apps/web-admin-manager`
- Role: `ADMIN_MANAGER` platform UI
- Dev URL: `http://localhost:5173`
- Structure: `features/`, `pages/`, `routes/`, `services/`, `shared/`, `layouts/`
- Key feature areas: location/Cambodia provinces & districts, system settings, shop management

### `apps/web-admin`
- Role: `ADMIN` shop UI and `CASHIER` POS UI
- Dev URL: `http://localhost:5174`
- Structure: same pattern — `features/`, `pages/`, `routes/`, `services/`, `shared/`, `layouts/`

Both use **Vite** with `@tailwindcss/vite` plugin and **Zustand** for state management.

---

## 4. Backend structure

`apps/api` — Spring Boot monolith.

Key packages under `com.kambujaflow.kambujapos`:

| Package | Contents |
|---|---|
| `controller/` | REST controllers — `AuthController`, `AdminController`, `ShopController`, `ProductController`, `SaleController`, `CashierController`, `ReportController`, `TelegramController`, etc. |
| `service/` | Business logic — `AuthService`, `SaleService`, `InventoryService`, `TelegramNotificationService`, etc. |
| `repository/` | Spring Data MongoDB repositories |
| `entity/` | Document models — `User`, `Shop`, `Product`, `Category`, `Inventory`, `Sale`, `Payment`, `Receipt`, `Customer`, `StockMovement`, `TelegramSetting`, `AuditLog`, `Notification` |
| `dto/request/` | Input DTOs |
| `dto/response/` | Output DTOs |
| `security/` | `JwtAuthenticationFilter`, `JwtService`, `RoleGuard`, `ShopScopeGuard`, `UserDetailsServiceImpl` |
| `enums/` | `RoleName`, `SaleStatus`, `PaymentMethod`, `PaymentStatus`, `ProductStatus`, `StockMovementType`, `CodeType`, `NotificationType`, `SettingType`, `ShopStatus`, `UserStatus` |
| `config/` | `SecurityConfig`, `CorsConfig`, `MongoConfig`, `SwaggerConfig`, `TelegramConfig` |
| `waf/` | Web Application Firewall filters — `RateLimitFilter`, `RequestValidationFilter`, `SqlInjectionPatternFilter`, `XssProtectionFilter`, `WafFilter` |
| `util/` | `BarcodeUtil`, `DateUtil`, `FileUtil`, `MoneyUtil`, `ReceiptNumberUtil`, `SaleNumberUtil`, `StringUtil` |
| `common/` | `ApiResponse`, `PageResponse`, `ErrorResponse`, `BusinessException`, `ResourceNotFoundException`, `GlobalExceptionHandler`, `Constants` (API_PREFIX="/api", DEFAULT_PAGE_SIZE=20, MAX_PAGE_SIZE=100) |

---

## 5. Database structure

**MongoDB** database (`kambuja_pos` by default). Collections correspond to `@Document` entity classes:

| Collection | Entity | Purpose |
|---|---|---|
| `users` | `User` | Admin managers, admins, cashiers |
| `shops` | `Shop` | Shop records |
| `categories` | `Category` | Product categories |
| `products` | `Product` | Product catalog |
| `product_codes` | `ProductCode` | Barcodes/SKUs |
| `inventories` | `Inventory` | Stock levels per shop |
| `stock_movements` | `StockMovement` | In/out stock logs |
| `sales` | `Sale` | Sales transactions |
| `payments` | `Payment` | Payment records |
| `receipts` | `Receipt` | Issued receipts |
| `customers` | `Customer` | Customer records |
| `settings` | `Setting` | System/shop settings |
| `telegram_settings` | `TelegramSetting` | Bot token & webhook config |
| `notifications` | `Notification` | In-app notifications |
| `audit_logs` | `AuditLog` | Audit trail |

`application.yml`: `auto-index-creation: true`

---

## 6. Scripts and run commands

All scripts live in `scripts/sh/` (and Powershell versions in `scripts/ps1/`).

| Script | Purpose |
|---|---|
| `./scripts/sh/setup.sh` | Check tools, install frontend deps, prepare `.env`, validate backend |
| `./scripts/sh/dev.sh` | Start MongoDB, backend API, and both frontends concurrently. Supports `--api-only`, `--no-api`, `--no-manager`, `--no-web-admin`, `--ngrok`, `--cloudflare` |
| `./scripts/sh/test.sh` | Run backend unit tests (`./mvnw test`) |
| `./scripts/sh/load-env.sh` | Helper to load `.env` into shell environment |

Or start apps individually:
```bash
cd apps/api && ./mvnw spring-boot:run
cd apps/web-admin-manager && npm run dev
cd apps/web-admin && npm run dev
```

Requirements: Java 21+, Node.js 20+, npm 10+, MongoDB, mongosh.
Logs are written to `./logs/` when using `dev.sh`.

---

## 7. Environment variables needed

Copy `.env.example` → `.env` and update secrets before production.

| Variable | Default | Notes |
|---|---|---|
| `APP_NAME` | `kambuja-pos-api` | |
| `SERVER_PORT` | `8080` | API port |
| `MONGODB_URI` | `mongodb://localhost:27017/kambuja_pos` | |
| `JWT_SECRET` | *(none)* | **Required — must be ≥32 random bytes** |
| `JWT_ISSUER` | `kambuja-pos-api` | |
| `JWT_ACCESS_TOKEN_MINUTES` | `60` | |
| `BOOTSTRAP_ADMIN_MANAGER_NAME` | `Platform Manager` | |
| `BOOTSTRAP_ADMIN_MANAGER_EMAIL` | `manager@kambujaflow.local` | |
| `BOOTSTRAP_ADMIN_MANAGER_PASSWORD` | `change-me-before-production` | **Change before production** |
| `CORS_ENABLED` | `true` | |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | |
| `WAF_ENABLED` | `true` | |
| `WAF_MAX_REQUESTS_PER_MINUTE` | `120` | |
| `TELEGRAM_BOT_TOKEN` | *(none)* | Required for Telegram notifications |
| `MANAGEMENT_PORT` | `8081` | Actuator/Prometheus metrics |

---

## 8. Khmer UI/business vocabulary

The application supports Khmer language and Cambodia-specific location data.

- **Language label:** `ខ្មែរ` — used in the language switcher (`value="km"`)
- **Cambodia locations:** All 25 provinces and Phnom Penh districts are stored in `web-admin-manager/src/features/location/utils/cambodiaLocations.js`
  - Province: `ខេត្ត` / `Province`
  - District/Khan: `ស្រុក` / `Khan` / `District`
  - Capital: `រាជធានី` / `Capital`
  - Example provinces: `រាជធានីភ្នំពេញ` (Phnom Penh), `បន្ទាយមានជ័យ` (Banteay Meanchey), `បាត់ដំបង` (Battambang), `កំពង់ធំ` (Kampong Thom), `សៀមរាប` (Siem Reap)

> **Rule:** Preserve all Khmer text exactly. Do not transliterate, romanize, or "clean up" Khmer strings.

---

## 9. Rules for AI agents

1. **Preserve Khmer text** — never edit, rename, or remove Khmer strings, file names containing Khmer, or Cambodia location data.
2. **Do not rename files** without explicit user approval.
3. **Do not delete files** without explicit user approval.
4. Prefer creating new files over modifying large existing files when the change is isolated.
5. Always run `./scripts/sh/test.sh` after backend changes.
6. Do not commit secrets into `.env.example` or source code.
7. Use `./scripts/sh/dev.sh` for local development rather than manually starting services.
8. When adding new REST endpoints, prefix with `/api` (the API_PREFIX constant).

---

## 10. Current known issues

- **Test coverage is minimal:** Only `KambujaPosApplicationTests` and `UtilityTests` exist in `apps/api/src/test/`. The project would benefit from broader unit and integration test coverage.
- **Telegram webhook dependency:** The backend startup does not fail hard on a missing `TELEGRAM_BOT_TOKEN`, but Telegram notification features will silently not work. The dev script warns if the token is the placeholder value.
- **WAF audit mode:** The WAF can run in `WAF_AUDIT_ONLY=true` mode (logging only, no blocking) — useful for debugging false positives.
- **Ngrok vs Cloudflare:** `dev.sh` supports both tunnel options, but Cloudflare (`--cloudflare`) is recommended over ngrok (`--ngrok`).
- **No frontend tests** were discovered in the React apps; both `web-admin` and `web-admin-manager` lack test suites.

---

*Generated from codebase exploration on 2026-06-21.*
