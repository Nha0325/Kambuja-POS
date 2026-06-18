#!/usr/bin/env bash
set -e

# Create directories
mkdir -p docs/legacy/old-public-pages
mkdir -p docs/html-prototype
mkdir -p database/migrations
mkdir -p database/seeders
mkdir -p public/uploads
mkdir -p app/Helpers

# 1. Move old duplicate/procedural files and html
if [ -d "html" ]; then
    mv html/* docs/html-prototype/ 2>/dev/null || true
    rmdir html 2>/dev/null || true
fi

# 2. Keep full.sql, full_fixed.sql, schema.sql by moving them into database/
mv full.sql full_fixed.sql schema.sql database/ 2>/dev/null || true

# 3. Move migration_001_add_category.sql into database/migrations/
mv migration_001_add_category.sql database/migrations/ 2>/dev/null || true

# 4. Move tools/users.sql into database/seeders/users.sql
mv tools/users.sql database/seeders/users.sql 2>/dev/null || true

# 5. Move uploads/ into public/uploads/
if [ -d "uploads" ] && [ "$(ls -A uploads 2>/dev/null)" ]; then
    mv uploads/* public/uploads/ 2>/dev/null || true
    rmdir uploads 2>/dev/null || true
fi

# 6. Move helpers.php to app/Helpers/
mv helpers.php app/Helpers/helpers.php 2>/dev/null || true

# 7. Move legacy PHP files to docs/legacy/old-public-pages/
# List of procedural php files in public/ that should be moved
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
    "styles.css" "tables.php" "test_telegram.php" "unpaid_invoices.php" "users.php"
)

for file in "${files[@]}"; do
    if [ -f "public/$file" ]; then
        mv "public/$file" "docs/legacy/old-public-pages/"
    fi
done

# We also move auth.php, config.php, db.php to legacy since they are replaced by Core and config folders
mv auth.php db.php readme.txt tools/create_user.php tools/daily_sales_report.php docs/legacy/old-public-pages/ 2>/dev/null || true

echo "Refactor move complete."
