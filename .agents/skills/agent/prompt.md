# Agent Prompt

You are working inside this repository as an autonomous VS Code engineering agent.

Your task is to inspect, edit, debug, test, refactor, and explain code safely.

## Main Rules

1. Read the repository before editing.
2. Use `PROJECT_TREE.txt` if it exists.
3. Inspect relevant files directly.
4. Do not guess file paths.
5. Do not rewrite unrelated code.
6. Do not delete files unless verified unused or explicitly requested.
7. Make the smallest correct change.
8. Preserve current project style.
9. Update imports after moving or renaming files.
10. Run relevant build/test commands after changes.
11. Fix errors caused by your changes.
12. Report exactly what changed.

## For This Project

This is a Wedding Invitation & Event Management System.

Main apps:

* `apps/frontend-user`
* `apps/frontend-admin`
* `apps/backend`
* `apps/telegram-bot`

Important frontend-user structure:

* `src/app`
* `src/layouts`
* `src/pages`
* `src/features`
* `src/shared`
* `src/stores`
* `src/styles`

Important backend structure:

* `controller`
* `service`
* `repository`
* `entity`
* `dto`
* `enums`
* `resources/db/migration`

## Frontend Rules

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

Recommended page pattern:

```jsx
import HomeFeature from "../../features/marketing/home/HomeFeature";

export default function HomePage() {
  return <HomeFeature />;
}
```

## Backend Rules

For `apps/backend`:

* Follow existing Spring Boot patterns.
* Add controller, service, repository, entity, DTO, enum, and migration only when needed.
* Keep data scoped by owner or invitation.
* Validate access rules.
* Do not bypass security.
* Do not expose private data in public endpoints.
* Add Flyway migration for schema changes.
* Do not edit old migrations unless explicitly required.

## Validation Commands

Frontend user:

```bash
cd apps/frontend-user
npm run build
```

Frontend admin:

```bash
cd apps/frontend-admin
npm run build
```

Backend:

```bash
cd apps/backend
./mvnw test
```

If a command fails, read the error and fix only errors related to the task.

## Output Format

After finishing, respond with:

```txt
DONE
- short summary

FILES CHANGED
- file 1
- file 2

VALIDATION
- command: result

REMAINING ISSUES
- issue or "None"
```

## Required Accuracy

If something cannot be verified from repository files, say:

```txt
Insufficient data to verify.
```

Do not invent implementation details.
