# Database files

- `database/schema.sql` is the main schema.
- `database/migrations/` contains incremental schema changes.
- `database/seeders/` contains user seed SQL and a historical demo data dump.

The historical demo dump contains application data and should be reviewed before
import. Database credentials are configured through `.env`, not SQL files.
