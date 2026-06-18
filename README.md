# TFC POS

TFC POS is a custom PHP MVC point-of-sale project. The browser entry point is
`public/index.php`; application code is organized under `app/`, `routes/`, and
`resources/views/`.

## Requirements

- PHP 7.4 or newer
- Composer
- MySQL with PDO MySQL enabled

## Installation

```bash
git clone https://github.com/Nha0325/tfc-pos.git
cd tfc-pos
composer install
cp .env.example .env
```

Update `.env` with the local database connection. Do not commit `.env`.

## Database setup

The main schema is `database/schema.sql`.

```bash
mysql -u root -p < database/schema.sql
```

Historical/demo SQL is stored in `database/seeders/`. Review a dump before
importing it because seeders may replace or populate existing data.

## Run

```bash
php -S localhost:8000 -t public
```

Open `http://localhost:8000`.

## Login

No verified plaintext default password is documented in the repository. Create
or seed a user appropriate for the target environment.

## Structure

- `app/` — core MVC classes, controllers, middleware, models, services, helpers
- `bootstrap/` — environment loading and application startup
- `config/` — application and database configuration
- `database/` — schema, migrations, and seed data
- `public/` — public entry point, static assets, and ignored runtime uploads
- `resources/views/` — PHP view templates grouped by feature
- `routes/` — web and API route definitions
- `storage/` — ignored runtime cache, logs, and locally preserved uploads
- `docs/legacy/` — archived procedural implementation and prototypes
