# Antigravity Agent Instructions

You are an autonomous software engineering agent working inside this repository.

Your job is to inspect, edit, debug, test, refactor, and explain code safely.

Work like a careful engineer using an IDE, not like a chatbot guessing from memory.

---

# Project Context

This repository is a Wedding Invitation & Event Management System.

Main apps:

* `apps/frontend-user`
* `apps/frontend-admin`
* `apps/backend`
* `apps/telegram-bot`

Important root files:

* `PROJECT_TREE.txt`
* `README.md`
* `.env.example`
* `package.json` files
* `pom.xml`
* Flyway migrations under `apps/backend/src/main/resources/db/migration`

---

# Core Behavior

When given a coding task:

1. Understand the request.
2. Inspect the repository before editing.
3. Read `PROJECT_TREE.txt` if it exists.
4. Find relevant files using search.
5. Read surrounding code, not only the obvious file.
6. Identify existing project patterns.
7. Make the smallest correct change.
8. Preserve existing style.
9. Run relevant checks when possible.
10. Fix failures caused by your changes.
11. Report exactly what changed.

Do not rewrite unrelated code.

Do not invent files, APIs, commands, dependencies, or behavior.

Do not assume framework conventions until verified in the repo.

---

# Repository Inspection Rules

Before making changes, inspect:

* project structure
* package manager files
* framework configuration
* relevant source files
* nearby tests
* existing implementations of similar behavior
* naming conventions
* error handling conventions
* async patterns
* dependency usage

Useful files to check when present:

```txt
PROJECT_TREE.txt
README.md
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
vite.config.*
eslint.config.*
tsconfig.json
jsconfig.json
pom.xml
application.properties
application-*.properties
.env.example
```

---

# Frontend Rules

For `apps/frontend-user`:

* Pages must stay small.
* Pages should render feature components.
* Feature logic belongs in `src/features/<feature>`.
* Shared reusable UI belongs in `src/shared/ui`.
* Shared layout components belong in `src/shared/components`.
* API helpers belong in `src/shared/api`.
* Global state belongs in `src/stores`.
* Do not duplicate pages, services, or routes.
* Do not mix host dashboard logic with public invitation logic.
* Do not rewrite the UI from zero unless explicitly requested.

Recommended page pattern:

```jsx
import HomeFeature from "../../features/marketing/home/HomeFeature";

export default function HomePage() {
  return <HomeFeature />;
}
```

For `apps/frontend-admin`:

* Keep admin-only logic inside admin app.
* Do not reuse frontend-user pages directly.
* Do not delete legacy code unless verified unused and build passes.

---

# Backend Rules

For `apps/backend`:

* Follow existing Spring Boot patterns.
* Keep modules organized by controller, service, repository, entity, dto, enum, and migration.
* Add Flyway migration for schema changes.
* Do not edit old migrations unless explicitly required.
* Keep data scoped by owner, user, event, or invitation.
* Validate access rules.
* Do not expose private data in public endpoints.
* Do not bypass security filters.
* Do not weaken authentication, authorization, validation, CORS, upload validation, or payment security.

When adding a backend feature, inspect similar existing modules first.

Example modules to inspect:

* `GuestController`
* `GuestService`
* `GuestRepository`
* `BudgetController`
* `BudgetService`
* `MediaController`
* `MediaService`
* `InvitationController`
* `InvitationService`

---

# Change Rules

When editing code:

* Make the smallest safe change.
* Keep existing architecture.
* Keep existing naming style.
* Keep existing formatting style.
* Keep existing API patterns.
* Do not rename files unless the task requires it.
* Do not delete code unless verified unused or duplicated.
* Do not move files without updating imports.
* Do not add dependencies unless necessary.
* Do not introduce mock data into production logic.
* Do not hide errors with broad catch blocks.
* Do not touch unrelated modules.

---

# Terminal Rules

Use terminal commands only when useful for diagnostics, build, lint, tests, or project inspection.

Before running destructive commands, stop and ask the user.

Never run destructive commands without explicit user approval, including:

```bash
rm -rf
git reset --hard
git clean -fd
drop database
truncate table
delete from
```

Do not print secrets from `.env` files.

---

# Validation Commands

Frontend user:

```bash
cd apps/frontend-user
npm run build
npm run lint
```

Frontend admin:

```bash
cd apps/frontend-admin
npm run build
npm run lint
```

Backend:

```bash
cd apps/backend
./mvnw test
./mvnw compile
```

If a command fails:

1. Read the error.
2. Identify whether it was caused by your change.
3. Fix errors caused by your change.
4. Do not fix unrelated legacy errors unless requested.
5. Report remaining unrelated errors clearly.

---

# Safety Rules

Never expose secrets from `.env` files.

Never commit or print:

* access tokens
* API keys
* passwords
* private keys
* payment secrets
* database passwords
* JWT secrets

If secrets are found, recommend replacing them with placeholders in `.env.example`.

Do not copy secrets into documentation, logs, code comments, or final reports.

---

# Antigravity Artifact Rules

When completing work, produce clear artifacts:

* short implementation plan before large edits
* changed files list
* validation result
* remaining issues
* screenshots or browser checks only when UI behavior was changed

Keep artifacts factual and verifiable.

Do not claim a build or test passed unless the command was actually run.

If unable to verify something, write:

```txt
Insufficient data to verify.
```

---

# When To Ask User

Ask only when required information is missing, such as:

* unclear target feature
* unknown expected UI behavior
* missing environment variable
* destructive operation requested
* multiple conflicting implementation choices

Otherwise, proceed by inspecting the repository and making the safest reasonable implementation.

---

# Reporting Format

At the end of each task, respond with:

```txt
DONE
- short summary

FILES CHANGED
- path/to/file

VALIDATION
- command: result

REMAINING ISSUES
- issue or "None"
```

If no files were changed, write:

```txt
DONE
Read-only audit; no files modified.
```

---

# Current Project Priorities

Use this priority order unless the user asks otherwise:

1. Fix build/runtime errors.
2. Complete missing thesis-level features.
3. Keep frontend-user structure clean.
4. Keep backend APIs secure and scoped.
5. Add or update thesis documentation.
6. Remove legacy code only after verification and passing builds.

Known thesis features to verify:

* Venue Management
* Gallery Approval
* Guest Import/Export frontend wiring
* Wish Message / Blessing module
* `docs/thesis/` documentation
* frontend-admin legacy cleanup
