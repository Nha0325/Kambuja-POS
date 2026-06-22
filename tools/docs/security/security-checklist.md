# Security Checklist

## Required Before Deployment

- Replace `JWT_SECRET` with a random secret of at least 32 bytes.
- Replace `BOOTSTRAP_ADMIN_MANAGER_PASSWORD`.
- Restrict `CORS_ALLOWED_ORIGINS` to deployed frontend origins.
- Protect MongoDB with authentication and network access controls.
- Use HTTPS and secure cookies in production.
- Keep `.env` files outside version control.
- Restrict access to MongoDB backups.

## Confirmed Application Controls

- JWT is accepted through an HTTP-only cookie or Bearer token.
- Backend routes explicitly allow roles; ADMIN_MANAGER has no global bypass.
- ADMIN and CASHIER requests derive `shopId` from the authenticated user.
- CASHIER creation ignores client-provided role and shop assignment.
- Helmet and request rate limiting are enabled.
- Notification channel requests store chat IDs only; bot tokens remain environment values.

## Verification

```bash
./scripts/sh/test.sh
```

Verify unauthenticated requests receive `401`, wrong-role requests receive `403`, and cross-shop resource IDs are rejected.
