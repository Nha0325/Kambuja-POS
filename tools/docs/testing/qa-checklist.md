# QA Checklist

## Automated Validation

```bash
./scripts/sh/test.sh
```

Expected:

- backend JavaScript syntax validation passes
- frontend ESLint passes
- frontend production build passes

## Authentication

- ADMIN_MANAGER opens `/admin-manager/dashboard`
- ADMIN opens `/admin/dashboard`
- CASHIER opens `/cashier/pos`
- wrong-role requests receive `403`
- missing or invalid authentication receives `401`

## Shop Scope

- ADMIN sees only its assigned shop data
- CASHIER sees only its assigned shop products and sales
- CASHIER creation ignores client-supplied `shopId`
- cross-shop product, inventory, payment, receipt, and sale IDs are rejected

## POS

- code lookup returns a product from the current shop
- insufficient stock rejects a sale
- sale creation reduces inventory
- sale creation records payment, receipt, stock movement, and audit data
- `/sales/today` returns current-day sales only

## Operations

- MongoDB is reachable through `MONGODB_URI`
- Backend listens on the configured port
- Frontend listens on the configured Vite port
- `.env` remains ignored by Git
