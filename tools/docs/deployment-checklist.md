# Deployment Checklist

1. Set production environment values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `BOOTSTRAP_ADMIN_MANAGER_EMAIL`
   - `BOOTSTRAP_ADMIN_MANAGER_PASSWORD`
   - `CORS_ALLOWED_ORIGINS`
2. Run `./scripts/sh/test.sh`.
3. Run `npm run migrate:roles` in `Backend/`.
4. Build and start the configured deployment services.
5. Confirm:
   - API responds on port `8080`.
   - the single role-based frontend loads on port `5173`.
   - MongoDB data is persistent and protected.
   - CORS accepts only configured origins.
   - ADMIN_MANAGER, ADMIN, and CASHIER route isolation returns expected `403` responses.
6. Create and verify a MongoDB backup.
7. Replace the bootstrap password after the first production login.
