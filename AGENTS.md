# TFC POS Agent Instructions

## Project overview

TFC POS is a custom PHP MVC point-of-sale system. The public web root is
`public/`, and `public/index.php` is the only application entry point.

Inspect `PROJECT_TREE.txt`, the active entry path, and nearby implementation
before changing code. Preserve existing behavior and make the smallest verified
change.

## Folder rules

- Application classes belong under `app/` with the `App\\` namespace.
- Controllers belong in `app/Http/Controllers/`.
- Middleware belongs in `app/Http/Middleware/`.
- Models belong in `app/Models/`.
- Services belong in `app/Services/`.
- Shared procedural helpers belong in `app/Helpers/helpers.php`.
- Web routes belong in `routes/web.php`; API routes belong in `routes/api.php`.
- PHP templates belong in feature folders under `resources/views/`.
- Browser-accessible assets belong under `public/assets/`.
- Runtime uploads belong under `public/uploads/` and must remain ignored.
- Historical code belongs under `docs/legacy/` and is not part of the runtime.

## PHP coding rules

- Use PascalCase class and class-file names.
- Keep namespaces aligned with the PSR-4 mapping in `composer.json`.
- Keep view filenames lowercase.
- Do not add business logic to `public/index.php`.
- Do not add framework dependencies unless required by the task.
- Do not rewrite unrelated code or fabricate unverified behavior.

## Database rules

- Read connection values from environment variables through `config/database.php`.
- Keep the main schema in `database/schema.sql`.
- Keep numbered migrations in `database/migrations/`.
- Keep seed/demo data in `database/seeders/`.
- Do not modify or remove production data without explicit authorization.
- Do not commit database passwords or other credentials.

## Git rules

- Inspect `git status` before editing.
- Preserve unrelated working-tree changes.
- Do not use destructive Git commands unless explicitly requested.
- Do not commit `.env`, runtime uploads, cache files, or logs.

## Safety rules

- Never print or commit passwords, tokens, private keys, cookies, payment
  secrets, or database credentials.
- Keep `.env` ignored and maintain only safe placeholders in `.env.example`.
- Keep real uploaded files out of Git.

## Validation

```bash
find . -name "*.php" -not -path "./docs/legacy/*" -not -path "./vendor/*" -print0 | xargs -0 -n1 php -l
composer dump-autoload
git status
find public/uploads -type f
```

## Reporting format

```txt
DONE
FILES MOVED
FILES DELETED
FILES CHANGED
VALIDATION RESULT
REMAINING ISSUES
```
