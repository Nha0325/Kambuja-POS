# Scripts / ស្គ្រីប

ស្គ្រីបសម្រាប់ development និង utility របស់ Kambuja POS។

## Structure

```
scripts/
├── sh/                  # 🐧 Linux / macOS (Bash)
│   ├── dev.sh           # Start all dev services
│   ├── git-pull.sh      # Pull with auto-stash
│   ├── git-push.sh      # Validate, commit & push
│   ├── git-sync.sh      # Wrapper for git-push
│   ├── load-env.sh      # Shared env loader (lib)
│   ├── seed.sh          # Seed MongoDB data
│   ├── setup.sh         # First-time project setup
│   ├── status.sh        # Check service health
│   └── test.sh          # Run all tests
│
└── ps1/                 # 🪟 Windows (PowerShell)
    ├── dev.ps1           # Start all dev services
    ├── git-pull.ps1      # Pull with auto-stash
    ├── git-push.ps1      # Validate, commit & push
    ├── git-sync.ps1      # Wrapper for git-push
    ├── seed.ps1          # Seed MongoDB data
    ├── setup.ps1         # First-time project setup
    ├── status.ps1        # Check service health
    └── test.ps1          # Run all tests
```

## Usage

### Linux / macOS

```bash
# បើក dev servers ទាំងអស់ (API + Frontend ២)
./scripts/sh/dev.sh

# បើកតែ backend (Spring Boot API)
./scripts/sh/dev.sh --api-only

# pullកូដថ្មីពី Git (pull + auto-stash)
./scripts/sh/git-pull.sh

# pushកូដទៅ Git (validate + push)
./scripts/sh/git-push.sh

# commit & push កូដទៅ Git
./scripts/sh/git-sync.sh

# setup project
./scripts/sh/setup.sh

```

### Windows (PowerShell)

```powershell
# បើក dev servers ទាំងអស់ (API + Frontend ២)
.\scripts\ps1\dev.ps1

# បើកតែ backend (Spring Boot API)
.\scripts\ps1\dev.ps1 --api-only

# ទាញកូដថ្មីពី Git (pull + auto-stash)
.\scripts\ps1\git-pull.ps1

# រុញកូដទៅ Git (validate + push)
.\scripts\ps1\git-push.ps1

# Commit & push កូដទៅ Git
.\scripts\ps1\git-sync.ps1

# រត់លើកដំបូង (install dependencies)
.\scripts\ps1\setup.ps1

# ពិនិត្យមើល services ដែលកំពុងរត់
.\scripts\ps1\status.ps1

```
