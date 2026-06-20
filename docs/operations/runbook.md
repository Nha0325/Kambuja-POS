# Operations Runbook

## Local startup

```bash
./scripts/setup.sh
./scripts/dev.sh
```

Check status:

```bash
./scripts/status.sh
```

Logs are written to:

```text
logs/api.log
logs/web-admin-manager.log
logs/web-admin.log
```

## Docker startup

```bash
docker compose --env-file .env -f infra/docker-compose.yml up --build
```

Services:

- MongoDB: `localhost:27017`
- API: `localhost:8080`
- management health and metrics: internal `api:8081`
- ADMIN_MANAGER UI: `localhost:5173`
- ADMIN/CASHIER UI: `localhost:5174`
- Prometheus: `localhost:9090`

## Backup

```bash
./infra/backup/mongodb-backup.sh
```

Restore only from a verified backup:

```bash
./infra/backup/mongodb-restore.sh backups/<timestamp>
```

## Telegram

Set the token only through the runtime environment:

```bash
export TELEGRAM_BOT_TOKEN="<TELEGRAM_BOT_TOKEN>"
```

Never write the real token into source code, documentation, commits, issues, or prompts.

## Failure checks

API startup failure:

1. Check `logs/api.log`.
2. Confirm MongoDB is reachable through `MONGODB_URI`.
3. Confirm `JWT_SECRET` and `TELEGRAM_BOT_TOKEN` exist.
4. Confirm ports `8080` and `8081` are free.

Frontend startup failure:

1. Check the matching log file.
2. Run `npm ci` in the application.
3. Run `npm run build`.
4. Confirm ports `5173` and `5174` are free.
