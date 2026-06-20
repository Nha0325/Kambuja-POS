# Development Seed Data

The seed script creates:

- one sample shop
- one category
- one product
- one inventory record

It intentionally does not create users because passwords must be BCrypt encoded by the backend.

Run against the local database:

```bash
mongosh "mongodb://localhost:27017/kambuja_pos" tools/seed/sample-data.js
```

Do not run sample seed data against production.
