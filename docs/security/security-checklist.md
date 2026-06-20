# Security Checklist

## Required before deployment

- Replace `JWT_SECRET` with a random secret of at least 32 bytes.
- Replace `BOOTSTRAP_ADMIN_MANAGER_PASSWORD`.
- Restrict `CORS_ALLOWED_ORIGINS` to deployed frontend origins.
- Protect MongoDB with authentication and network access controls.
- Use HTTPS for API and frontend traffic.
- Keep `.env` outside version control.
- Keep `TELEGRAM_BOT_TOKEN` outside frontend forms and API request bodies.
- Restrict access to MongoDB backups.
- Configure Telegram bot tokens only through the authenticated ADMIN interface.

## Confirmed application controls

- JWT authentication is stateless.
- Backend methods use role checks.
- Shop-scoped services resolve the current authenticated user's shop.
- Cashier creation does not accept a frontend-provided `shopId`.
- Telegram responses mask the bot token.
- Telegram settings accept only chat ID and enabled state.
- Request validation and WAF filters are located in `apps/api`.

## Deployment verification

Run:

```bash
./scripts/test.sh
```

Then verify unauthorized requests receive `401` and wrong-role requests receive `403`.
