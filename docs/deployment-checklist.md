# Deployment Checklist

1. Set production environment values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `BOOTSTRAP_ADMIN_MANAGER_EMAIL`
   - `BOOTSTRAP_ADMIN_MANAGER_PASSWORD`
   - `TELEGRAM_BOT_TOKEN`
   - `CORS_ALLOWED_ORIGINS`
2. Run `./scripts/test.sh`.
3. Build containers:

   ```bash
   docker compose --env-file .env -f infra/docker-compose.yml build
   ```

4. Start services:

   ```bash
   docker compose --env-file .env -f infra/docker-compose.yml up -d
   ```

5. Confirm:
   - API responds on port `8080`.
   - ADMIN_MANAGER login page loads on port `5173`.
   - ADMIN/CASHIER login page loads on port `5174`.
   - MongoDB data volume is persistent.
   - CORS accepts only configured origins.
6. Create and test a MongoDB backup.
7. Change the bootstrap password after the first production login.
