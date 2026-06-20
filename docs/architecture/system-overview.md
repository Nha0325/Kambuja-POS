# System Overview

## Components

### API

`apps/api` is the only backend service. It contains:

- Spring Boot MVC controllers
- Spring Security and JWT authentication
- MongoDB repositories
- shop-scoped business services
- Telegram Bot API integration
- request validation and WAF filters

Java package: `com.kambujaflow.kambujapos`.

### Platform Manager UI

`apps/web-admin-manager` is restricted to `ADMIN_MANAGER`.

It manages:

- platform dashboard
- admin accounts
- all shops
- province and city views
- platform sales and stock reports
- notifications
- system settings

### Shop and POS UI

`apps/web-admin` serves two roles:

- `ADMIN`: shop, product, category, inventory, cashier, customer, report, Telegram, notification, and setting management
- `CASHIER`: product lookup, cart, sale, payment, receipt, and today's sales

## Data Flow

1. A user signs in through `POST /api/auth/login`.
2. The API authenticates the user and returns a JWT plus user role.
3. The frontend stores the session in its role-specific local storage key.
4. Axios attaches the JWT to protected API requests.
5. Spring Security validates the JWT and method role rules.
6. Shop services resolve the authenticated user's shop from `ShopScopeGuard`.
7. Repositories read or write MongoDB documents.
8. Telegram notifications are sent by the API when an admin configures a shop bot.

## Trust Boundaries

- Frontend route guards improve navigation but do not provide authorization.
- Backend `@PreAuthorize` rules enforce role access.
- Shop-scoped services derive `shopId` from the authenticated user.
- `ADMIN_MANAGER` platform endpoints can aggregate across shops.
- Telegram bot tokens remain backend data and are never returned unmasked.
