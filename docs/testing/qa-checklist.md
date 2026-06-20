# QA Checklist

## Automated validation

```bash
./scripts/test.sh
```

Expected:

- backend Maven tests pass
- ADMIN_MANAGER frontend production build passes
- ADMIN/CASHIER frontend production build passes

## Authentication

- valid ADMIN_MANAGER credentials open `/dashboard`
- ADMIN_MANAGER cannot use `/admin/*` or `/pos/*`
- valid ADMIN credentials open `/admin/dashboard`
- ADMIN cannot use `/pos/*`
- valid CASHIER credentials open `/pos/sale`
- CASHIER cannot use `/admin/*`
- missing or invalid JWT receives `401`
- wrong backend role receives `403`

## Shop scope

- ADMIN sees only its assigned shop data
- CASHIER sees only its assigned shop products and sales
- cashier creation ignores any client-supplied shop selection
- product, inventory, customer, payment, receipt, and sale access reject other-shop IDs

## POS

- barcode lookup returns the correct product
- insufficient inventory rejects a sale
- completed sale reduces inventory
- payment records change correctly
- receipt requires a fully paid sale
- today's sales contains only current-day records

## Telegram

- backend fails clearly when `TELEGRAM_BOT_TOKEN` is missing
- `/api/telegram/test` requires ADMIN authentication
- bot token never appears in API responses
- low-stock and sale alert messages contain the expected fields

## Operations

- `/actuator/health` responds
- `/actuator/prometheus` responds on the management port
- MongoDB backup and restore commands are tested before production
- `.env` is ignored by Git
