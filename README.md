# Kambuja POS

Kambuja POS contains a Node.js/Express backend and a React/Vite frontend.

## Applications

| Application | Path | Default URL |
|---|---|---|
| Backend API | `Backend/` | `http://localhost:8080` |
| Frontend | `Frontend/` | `http://localhost:5173` |

The API routes are mounted under `/api/v1`.

## Requirements

- Node.js 20+
- npm
- MongoDB

## Setup

```bash
./scripts/sh/setup.sh
```

The setup script installs dependencies from both lock files and creates missing application env files from their templates.

Update the placeholder secrets and credentials before starting the application.

## Development

Start MongoDB, then run:

```bash
./scripts/sh/dev.sh
```

Start applications separately:

```bash
cd Backend && npm run dev
cd Frontend && npm run dev
```

Available development flags:

```bash
./scripts/sh/dev.sh --no-frontend
./scripts/sh/dev.sh --no-backend
```

## Validation

```bash
./scripts/sh/test.sh
```

This validates Backend JavaScript syntax, runs Frontend lint, and creates a production Frontend build.

## Windows

```powershell
.\scripts\ps1\setup.ps1
.\scripts\ps1\dev.ps1
.\scripts\ps1\test.ps1
```

## Environment

- Backend: `Backend/.env`
- Frontend: `Frontend/.env`

The Frontend API base URL is configured with `VITE_BASE_URL` in `Frontend/.env`.
