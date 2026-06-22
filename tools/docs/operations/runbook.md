# Operations Runbook

## Local Startup

```bash
./scripts/sh/setup.sh
./scripts/sh/dev.sh
```

`dev.sh` starts MongoDB when needed, migrates legacy roles and shop ownership, seeds the configured ADMIN_MANAGER, then starts Backend and Frontend.

Services:

- MongoDB: `localhost:27017`
- Backend: `localhost:8080`
- Frontend: `localhost:5173`

Logs:

- `logs/mongodb.log`
- `logs/backend.log`
- `logs/frontend.log`

## Validation

```bash
./scripts/sh/test.sh
```

## Failure Checks

1. Confirm MongoDB is reachable through `MONGODB_URI`.
2. Check `logs/backend.log` or `logs/frontend.log`.
3. Confirm ports `8080` and `5173` are free.
4. Run `npm test` in `Backend/`.
5. Run `npm run lint` and `npm run build` in `Frontend/`.
