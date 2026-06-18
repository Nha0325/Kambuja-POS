# FTC POS System

A clean, modern Point of Sale (POS) system built with a custom MVC PHP framework.

## Features
- Dashboard with key statistics
- Product and Category management
- Customer and Supplier management
- Sales (POS interface)
- Purchases
- Stock tracking and movements
- Reports (Sales, Purchases, Stock, Profit)
- System Settings

## Setup Instructions

1. **Clone repo:**
   ```bash
   git clone git@github.com:Nha0325/ftc-pos.git
   cd ftc-pos
   ```

2. **Database:**
   Import the database using the provided script:
   ```bash
   ./scripts/import-db.sh
   ```

3. **Run project:**
   Start a PHP development server pointing to the `public/` directory:
   ```bash
   php -S localhost:8000 -t public/
   ```

4. **Login:**
   Use the default credentials in your database.

## Deployment
Push updates easily:
```bash
./scripts/git-push.sh "Your commit message"
```
