1. Project Target
Project name: FTC POS / Ecommerce Laravel

Current repo:
- Plain PHP POS
- Real app in public/
- Static design in html/
- SQL files in root
- Not Laravel yet

Target:
- Convert to Laravel
- Keep old code in legacy/
- Build clean POS/Ecom system
2. Role System
admin
- full access
- manage users
- manage products
- manage categories
- manage tables
- manage invoices
- manage reports
- manage settings

admin_manager
- manage products
- manage categories
- manage tables
- manage cashiers
- view sales
- view reports
- cannot delete admin

cashier
- POS screen only
- open table / takeaway
- add product to invoice
- checkout
- receive payment
- print receipt
- view own sales

Old role mapping:

old admin  → admin
old sale   → cashier
new role   → admin_manager
3. Clean Laravel Structure
ftc-pos/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── FloorController.php
│   │   │   │   ├── TableController.php
│   │   │   │   ├── InvoiceController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   └── SettingController.php
│   │   │   │
│   │   │   ├── Manager/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── TableController.php
│   │   │   │   ├── CashierController.php
│   │   │   │   └── ReportController.php
│   │   │   │
│   │   │   └── Cashier/
│   │   │       ├── DashboardController.php
│   │   │       ├── PosController.php
│   │   │       ├── CartController.php
│   │   │       ├── CheckoutController.php
│   │   │       ├── ReceiptController.php
│   │   │       └── ShiftController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php
│   │   │   ├── AdminManagerMiddleware.php
│   │   │   └── CashierMiddleware.php
│   │   │
│   │   └── Requests/
│   │       ├── ProductRequest.php
│   │       ├── CategoryRequest.php
│   │       ├── TableRequest.php
│   │       ├── UserRequest.php
│   │       └── CheckoutRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Setting.php
│   │   ├── Floor.php
│   │   ├── RestaurantTable.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── Invoice.php
│   │   ├── InvoiceItem.php
│   │   ├── Payment.php
│   │   └── Shift.php
│   │
│   └── Services/
│       ├── PosService.php
│       ├── CartService.php
│       ├── InvoiceService.php
│       ├── PaymentService.php
│       ├── ReceiptService.php
│       └── ReportService.php
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── admin.blade.php
│   │   │   ├── manager.blade.php
│   │   │   └── cashier.blade.php
│   │   │
│   │   ├── admin/
│   │   ├── manager/
│   │   └── cashier/
│   │
│   ├── css/
│   └── js/
│
├── routes/
│   ├── web.php
│   ├── auth.php
│   ├── admin.php
│   ├── manager.php
│   └── cashier.php
│
├── public/
│   ├── images/
│   └── uploads/products/
│
├── legacy/
│   ├── old-public/
│   ├── old-html/
│   └── old-sql/
│
├── .env
├── composer.json
├── package.json
└── README.md
4. Database Tables
users
settings
floors
restaurant_tables
categories
products
invoices
invoice_items
payments
shifts
expenses

Main money flow:

Product
→ Invoice
→ InvoiceItem
→ Payment
→ Receipt
→ Report
5. Laravel Setup Commands
sudo apt update
sudo apt install php php-cli php-mbstring php-xml php-curl php-zip php-mysql unzip curl git composer nodejs npm mysql-server -y
git clone https://github.com/Nha0325/ftc-pos.git
cd ftc-pos

Backup old code first:

mkdir -p legacy/old-public legacy/old-html legacy/old-sql

git mv public/* legacy/old-public/
git mv html/* legacy/old-html/
git mv schema.sql full.sql full_fixed.sql migration_001_add_category.sql legacy/old-sql/
git mv auth.php config.php db.php helpers.php legacy/old-public/

Create Laravel inside same repo:

composer create-project laravel/laravel temp-laravel
cp -a temp-laravel/. .
rm -rf temp-laravel

Setup Laravel:

cp .env.example .env
php artisan key:generate
npm install
npm run build
php artisan serve

Open:

http://localhost:8000
6. Prompt 1 — Read Repo First

Paste this first:

Read my existing repository first.

Repo:
https://github.com/Nha0325/ftc-pos

Do not edit files yet.

Analyze the current project and show:
1. Current folder tree.
2. Which files are real PHP app files.
3. Which files are static HTML prototype files.
4. Which SQL files exist.
5. Which features already exist.
6. Which files should move to legacy/.
7. What is missing for Laravel.

Current project is plain PHP POS, not Laravel.

Important:
- public/ contains the real PHP POS app.
- html/ contains static design prototype only.
- schema.sql, full.sql, full_fixed.sql are old database files.
- auth.php, config.php, db.php, helpers.php are old plain PHP core files.

Required new roles:
- admin
- admin_manager
- cashier

Do not create Laravel yet.
Do not delete files.
Only analyze and show the result clearly.
7. Prompt 2 — Create Laravel Base

Paste this after Prompt 1:

Now create a clean Laravel base structure.

Rules:
1. Do not delete old business logic.
2. Move old plain PHP files into legacy/.
3. Move old public/ to legacy/old-public/.
4. Move old html/ to legacy/old-html/.
5. Move old SQL files to legacy/old-sql/.
6. Create Laravel structure in the repo root.
7. Keep the project runnable with php artisan serve.

Create these route files:
- routes/web.php
- routes/auth.php
- routes/admin.php
- routes/manager.php
- routes/cashier.php

Create these middleware:
- AdminMiddleware.php
- AdminManagerMiddleware.php
- CashierMiddleware.php

Create role redirect after login:
- admin → /admin/dashboard
- admin_manager → /manager/dashboard
- cashier → /cashier/dashboard

Create seeders:
- AdminSeeder
- AdminManagerSeeder
- CashierSeeder

Show:
1. Files moved to legacy.
2. Files created.
3. Final tree.
4. Commands to run.
8. Prompt 3 — Build POS Modules

Paste this after Laravel base works:

Convert the old POS features into Laravel MVC.

Use old files only as reference:
- legacy/old-public/sale.php
- legacy/old-public/checkout.php
- legacy/old-public/print_receipt.php
- legacy/old-public/products.php
- legacy/old-public/categories.php
- legacy/old-public/tables.php
- legacy/old-public/reports.php
- legacy/old-public/settings.php
- legacy/old-public/users.php

Create models:
- User
- Setting
- Floor
- RestaurantTable
- Category
- Product
- Invoice
- InvoiceItem
- Payment
- Shift
- Expense

Create services:
- PosService
- CartService
- InvoiceService
- PaymentService
- ReceiptService
- ReportService
- TableService

Create cashier flow:
1. Open POS screen.
2. Choose table or takeaway.
3. Create or reuse open invoice.
4. Add product to invoice.
5. Update quantity.
6. Remove item.
7. Apply discount.
8. Checkout with cash/QR/bank.
9. Save payment.
10. Mark invoice paid.
11. Print receipt.

Preserve old logic:
- table order
- takeaway order
- open invoice reuse
- USD/KHR totals
- exchange rate
- discount
- cash in
- change
- receipt print
- report

Do not put SQL in Blade.
Do not put business logic in Blade.
Use controllers and services.

Show final tree and changed files.
9. Clean Summary
Use Laravel.
Old PHP app → legacy/
Static html → legacy/old-html/
SQL files → legacy/old-sql/

Build order:
1. Read repo
2. Move old files to legacy
3. Create Laravel base
4. Add auth + roles
5. Convert database to migrations
6. Convert POS sale flow
7. Convert checkout/payment
8. Convert receipt
9. Convert reports
10. Clean README

Final target:

admin         = owner
admin_manager = shop manager
cashier       = seller / receive money