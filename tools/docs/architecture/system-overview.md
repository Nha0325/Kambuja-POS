# System Overview

## Components

### Backend

`Backend/` is a Node.js, Express, Mongoose, and MongoDB API.

- JWT authentication through an HTTP-only cookie or Bearer token
- `restrict.guard.js` for role authorization
- `shop-scope.guard.js` for ADMIN and CASHIER ownership boundaries
- platform APIs for ADMIN_MANAGER
- shop management APIs for ADMIN
- POS, payment, inventory, and receipt APIs for CASHIER

### Frontend

`Frontend/` is one React application with three route and layout groups:

- `/admin-manager/*` uses `AdminManagerLayout.jsx`
- `/admin/*` uses `AdminLayout.jsx`
- `/cashier/*` uses `CashierLayout.jsx`

## Roles

- `ADMIN_MANAGER`: platform dashboard, shops, ADMIN accounts, platform reports, and audit logs
- `ADMIN`: assigned shop, products, categories, inventory, suppliers, purchases, CASHIER accounts, reports, and notifications
- `CASHIER`: assigned shop POS, checkout, receipts, and today's sales

## Data Flow

1. A user signs in through `POST /api/v1/auth/login`.
2. The backend returns the normalized role and creates an HTTP-only JWT cookie.
3. `Protected.jsx` selects the matching frontend route group.
4. Backend role guards enforce access independently of frontend navigation.
5. Shop-scoped requests derive `shopId` from the authenticated user.
6. Mongoose reads or writes MongoDB documents.

## Trust Boundaries

- Frontend guards are navigation controls, not authorization.
- Backend routes deny roles that are not explicitly allowed.
- ADMIN_MANAGER has no implicit bypass into shop-management APIs.
- ADMIN and CASHIER cannot submit a different `shopId`.
- ADMIN_MANAGER has `shopId = null`; ADMIN and CASHIER require an assigned shop.
