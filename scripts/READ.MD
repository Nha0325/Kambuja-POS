# Kambuja POS Scripts

Scripts for the current `Backend/` Node.js API and `Frontend/` React application.

Backend uses `Backend/.env`. Frontend uses `Frontend/.env`.

## Structure

```text
scripts/
├── node/
│   └── check-backend.cjs
├── sh/
│   ├── dev.sh
│   ├── git-pull.sh
│   ├── git-push.sh
│   ├── git-sync.sh
│   ├── load-env.sh
│   ├── setup.sh
│   └── test.sh
└── ps1/
    ├── dev.ps1
    ├── git-pull.ps1
    ├── git-push.ps1
    ├── git-sync.ps1
    ├── setup.ps1
    └── test.ps1
```

## Linux / macOS

```bash
# Install Backend and Frontend dependencies.
./scripts/sh/setup.sh

# Start Backend and Frontend.
./scripts/sh/dev.sh

# Start one application only.
./scripts/sh/dev.sh --no-frontend
./scripts/sh/dev.sh --no-backend

# Validate Backend syntax, Frontend lint, and Frontend build.
./scripts/sh/test.sh

# Git helpers.
./scripts/sh/git-pull.sh
./scripts/sh/git-push.sh
./scripts/sh/git-sync.sh "commit message"
```

## Windows PowerShell

```powershell
.\scripts\ps1\setup.ps1
.\scripts\ps1\dev.ps1
.\scripts\ps1\dev.ps1 --no-frontend
.\scripts\ps1\dev.ps1 --no-backend
.\scripts\ps1\test.ps1

.\scripts\ps1\git-pull.ps1
.\scripts\ps1\git-push.ps1
.\scripts\ps1\git-sync.ps1 "commit message"
```

## Default URLs

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
