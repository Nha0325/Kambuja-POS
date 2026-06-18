#!/usr/bin/env bash
set -e

# Create required directories
mkdir -p app/Helpers
mkdir -p database/migrations
mkdir -p database/seeders
mkdir -p docs/html-prototype
mkdir -p docs/legacy/old-public-pages
mkdir -p storage/uploads
mkdir -p public/uploads

# Move helpers
[ -f "helpers.php" ] && mv helpers.php app/Helpers/helpers.php

# Move root SQL files
[ -f "full.sql" ] && mv full.sql database/full.sql
[ -f "full_fixed.sql" ] && mv full_fixed.sql database/full_fixed.sql
[ -f "schema.sql" ] && mv schema.sql database/schema.sql

# Move migrations
[ -f "migration_001_add_category.sql" ] && mv migration_001_add_category.sql database/migrations/migration_001_add_category.sql

# Move seeders
[ -f "tools/users.sql" ] && mv tools/users.sql database/seeders/users.sql

# Move html static files
if [ -d "html" ]; then
    mv html/* docs/html-prototype/ 2>/dev/null || true
    rmdir html 2>/dev/null || true
fi

# Move old public PHP pages
files=(
    "_debug.php" "_nav_user.php" "add_product.php" "api_cart.php" "api_cart.php_nkk" "api_hold.php"
    "cancel_invoice.php" "categories.php" "change_table.php" "checkout.php" "close_business.php"
    "close_business2.php" "edit_product.php" "export_csv.php" "export_invoice_pdf.php" "index.php_20251207"
    "login.php" "logout.php" "merge_pay.php" "open_business.php" "open_table.php" "print_closing_report.php"
    "print_merged_receipt.php" "print_receipt (11.11.25, 11.02 at night).php" "print_receipt (20.11.25, 2.05 in the afternoon).php"
    "print_receipt.php" "products.php" "products_delete.php" "products_toggle.php" "prompt.md" "release_table.php"
    "reports (15.11.25, 2.37 in the afternoon).php" "reports.php" "reports_business.php" "reports_graph.php"
    "reports_graph_adv.php" "reports_preorder.php" "reports_preorder_prints.php" "reports_preorder_vs_receipts.php"
    "reports_print_template.php" "reports_receipts.php" "sale.php" "settings.php" "signup.php" "style_global.php"
    "styles.css" "tables.php" "test_telegram.php" "unpaid_invoices.php" "users.php" "COMPLETE.md" "README.md"
)
for file in "${files[@]}"; do
    [ -f "public/$file" ] && mv "public/$file" docs/legacy/old-public-pages/
done

# Move scripts
[ -f "git-push.sh" ] && mv git-push.sh scripts/git-push.sh

# Move uploads (to storage by default, unless you want them in public)
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    mv uploads/* public/uploads/ 2>/dev/null || true
    rmdir uploads 2>/dev/null || true
fi

# Deletions (now replaced by new config and core MVC logic)
[ -f "auth.php" ] && rm auth.php
[ -f "config.php" ] && rm config.php
[ -f "db.php" ] && rm db.php
[ -f "readme.txt" ] && rm readme.txt

# Remove self after running
echo "Cleanup completed successfully."
# rm -f prompt.txt execute_refactor.sh
