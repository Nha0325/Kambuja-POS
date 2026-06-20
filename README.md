# Kambuja Flow Digital POS

`kambuja-pos` is a B2B point-of-sale and inventory platform.

## Applications

| Application | Purpose | Default URL |
|---|---|---|
| `apps/api` | Spring Boot, MongoDB, JWT, Telegram notifications | `http://localhost:8080` |
| `apps/web-admin-manager` | `ADMIN_MANAGER` platform UI | `http://localhost:5173` |
| `apps/web-admin` | `ADMIN` shop UI and `CASHIER` POS UI | `http://localhost:5174` |

Telegram logic is implemented inside `apps/api`. There is no separate Telegram service.

## Requirements

- Java 21+
- Node.js 20+
- npm 10+
- MongoDB

## Setup

```bash
cp .env.example .env
./scripts/setup.sh
```

Update `JWT_SECRET` and `BOOTSTRAP_ADMIN_MANAGER_PASSWORD` in `.env` before using the application outside local development.

## Development

Start MongoDB first, then run:

```bash
./scripts/dev.sh
```

Or start applications separately:

```bash
cd apps/api && ./mvnw spring-boot:run
cd apps/web-admin-manager && npm run dev
cd apps/web-admin && npm run dev
```

## Validation

```bash
./scripts/test.sh
```

Additional commands:

```bash
./scripts/status.sh
./scripts/seed.sh
```

Operational support:

- Docker Compose: `infra/docker-compose.yml`
- Nginx examples: `infra/nginx/`
- MongoDB backup and restore: `infra/backup/`
- Firewall examples: `infra/firewall/`
- Prometheus configuration: `infra/monitoring/prometheus.yml`
- Safe Git helpers: `scripts/git-pull.*`, `scripts/git-push.*`, `scripts/git-sync.*`

## Authentication

The API creates an initial `ADMIN_MANAGER` only when the `users` collection is empty. Credentials come from:

- `BOOTSTRAP_ADMIN_MANAGER_EMAIL`
- `BOOTSTRAP_ADMIN_MANAGER_PASSWORD`

All protected API requests require:

```http
Authorization: Bearer <token>
```

## Documentation

- [System architecture](docs/architecture/system-overview.md)
- [Folder structure](docs/architecture/folder-structure.md)
- [API reference](docs/api/endpoints.md)
- [MongoDB collections](docs/database/collections.md)
- [Security checklist](docs/security/security-checklist.md)
- [Deployment checklist](docs/deployment-checklist.md)
- [Feature map](docs/features/feature-map.md)
- [QA checklist](docs/testing/qa-checklist.md)
- [Operations runbook](docs/operations/runbook.md)
