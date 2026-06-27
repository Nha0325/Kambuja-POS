# DESIGN.md — Kambuja-POS Full UI Prototype

## Project Name

Kambuja-POS

## System Type

POS + Inventory + Shop Management + Subscription Platform.

This is not a small POS demo. Design it as a serious multi-role business platform for mini markets, retail shops, and small businesses.

## Brand

Company: Kambuja Flow Digital
Slogan: មរតកខ្មែរ បច្ចេកវិទ្យាអនាគត

## Tech / UI Direction

Create a modern SaaS-style dashboard UI similar to a React + Vite + Tailwind CSS application.

Use:

* Clean dashboard layouts
* Sidebar navigation
* Topbar
* Cards
* Tables
* Forms
* Modals
* Drawers
* Filters
* Search inputs
* Charts
* Status badges
* Responsive layouts
* English + Khmer labels where useful

Use mock data only. Do not create backend logic. Do not create database logic. This is UI prototype only.

---

# Roles

The system has exactly 3 roles:

1. ADMIN_MANAGER
2. ADMIN
3. CASHIER

---

# Role Theme

## Admin Manager Theme

Role: ADMIN_MANAGER
Purpose: Platform owner / system owner / super admin.

Visual style:

* Premium
* Professional
* Platform management feel

Colors:

* Primary: #7033ff
* Background: #fdfdfd
* Accent: #e2ebff

Use Violet Bloom style.

## Admin Theme

Role: ADMIN
Purpose: Shop owner / business owner.

Visual style:

* Clean
* Business
* Shop management feel

Colors:

* Primary: #1e69dc
* Background: #f8faff
* Accent: #dbeafe

Use Blue Business style.

## Cashier Theme

Role: CASHIER
Purpose: Fast selling / POS operation.

Visual style:

* Simple
* Fast
* Large buttons
* Scanner friendly

Colors:

* Primary: #4ac885
* Background: #fafffa
* Accent: #dcfce7

Use Green Fast POS style.

---

# Global Screens

Create these screens:

1. Landing / Welcome screen
2. Login screen
3. Forgot password screen
4. Role-based redirect dashboard
5. Admin Manager dashboard and pages
6. Admin dashboard and pages
7. Cashier POS and pages
8. Unauthorized / 403 page
9. Not found / 404 page
10. Profile page
11. Settings pages
12. Responsive mobile navigation

---

# Login Page

Create a polished login page.

Layout:

* Left brand panel
* Right login form card
* Mobile responsive single-column layout

Content:

* Kambuja-POS logo area
* Title: Kambuja-POS
* Subtitle: POS + Inventory Management Platform
* Email input
* Password input
* Remember me checkbox
* Forgot password link
* Login button
* Language switch: English / Khmer
* Demo role cards:

  * Admin Manager
  * Admin
  * Cashier

Redirect after login:

* ADMIN_MANAGER -> /admin-manager
* ADMIN -> /admin
* CASHIER -> /cashier/pos

---

# Admin Manager UI

Admin Manager manages the whole platform, shops, owners, subscriptions, POS access, reports, logs, and system settings.

Admin Manager must not look like a cashier POS page.

## Admin Manager Navigation

* Dashboard
* Shops
* Admins
* Locations
* Subscriptions
* POS Access
* Alerts / Notifications
* Reports
* Stock Overview
* System Logs
* Backup / Health
* Settings

## Admin Manager Dashboard

Cards:

* Total shops
* Active shops
* Locked shops
* Expired subscriptions
* Total admins
* Total cashiers
* Monthly subscription revenue
* Platform revenue
* System health
* Low stock shops overview

Widgets:

* Subscription revenue chart
* Active vs expired shops chart
* Recent shop registrations table
* Shops requiring attention list
* Latest audit logs
* Notification delivery status
* System health panel

## Admin Management Page

Features:

* List admins / shop owners
* Create admin
* Search by name, email, phone, shop
* Filter by active / disabled

Table columns:

* Admin name
* Email
* Phone
* Assigned shop
* Status
* Last login
* Created date
* Actions

Actions:

* View
* Edit
* Disable / Enable
* Reset password
* Assign shop

Form fields:

* Full name
* Email
* Phone
* Password
* Assign shop
* Status
* Notes

## Shop Management Page

Features:

* List shops
* Create shop
* Search and filters

Table columns:

* Shop code
* Shop name
* Owner / admin
* Province
* District / Khan
* Subscription plan
* POS access
* Status
* Created date
* Actions

Actions:

* View
* Edit
* Lock / Unlock
* Assign owner
* Manage subscription
* Manage POS access

Form fields:

* Shop name
* Auto shop code
* Owner / admin
* Phone
* Email
* Province
* District / Khan
* Commune / Sangkat
* Address
* Logo upload placeholder
* Status

## Subscription Page

Show plan cards:

* Basic
* Standard
* Pro
* Enterprise

Subscription table columns:

* Shop
* Plan
* Start date
* End date
* Status
* Monthly fee
* Payment status
* Actions

Actions:

* Activate
* Renew
* Expire
* Suspend
* View payment history

Plan form:

* Plan name
* Price
* Cashier limit
* Product limit
* Shop / branch limit
* POS enabled
* Reports enabled
* Telegram alert enabled

## POS Access Page

Show:

* Shops with POS access status
* Enable / disable POS per shop
* Cashier limit
* Product limit
* Subscription status
* Reason why POS is blocked:

  * Expired subscription
  * Shop locked
  * POS disabled
  * Cashier limit exceeded

## Location Management Page

Create UI for:

* Province list
* District / Khan list
* Commune / Sangkat list
* Store location list
* Create / edit location modal
* Active / inactive toggle

## System Reports Page

Reports:

* Platform revenue report
* Subscription revenue report
* Best shops report
* Inactive shops report
* Expired subscriptions report
* Admin activity report

Include:

* Date filter
* Export CSV button
* Summary cards
* Chart
* Table

## Stock Overview Page

Read-only cross-shop stock view:

* Low stock shops
* Out of stock products across shops
* Filter by shop / province / category
* Product stock overview table

## System Logs Page

Logs:

* Login logs
* Create / edit / delete logs
* Stock adjustment logs
* Payment logs
* Subscription logs
* Failed login attempts

Include:

* Filter by role
* Filter by action
* Filter by shop
* Filter by date
* Log detail drawer

## Notifications Page

Features:

* Send announcement to all shops
* Send message to one shop
* Send message to one admin
* Telegram / email / channel log
* Delivery status table

## Backup / Health Page

Cards:

* API status
* Database status
* Backup status
* Last backup time
* Server status
* Storage status

Actions:

* Export system data
* Restore request
* View backup history

## Global Settings Page

Fields:

* App name
* Logo
* Default currency
* Default tax
* Invoice format
* Maintenance mode
* Support contact
* Language settings

---

# Admin UI

Admin is the shop owner. Admin manages only own shop. Admin must not see other shops.

## Admin Navigation

* Dashboard
* Products
* Categories
* Inventory
* Purchases
* Suppliers
* Customers
* Cashiers
* Sales Monitor
* Reports
* Notifications
* Barcode / Labels
* Settings

## Admin Dashboard

Cards:

* Today sales
* Today profit
* Total products
* Low stock
* Out of stock
* Unpaid purchases
* Cashier sales today
* Customer debt
* Supplier balance
* Recent sales

Widgets:

* Sales chart
* Profit chart
* Low stock table
* Top selling products
* Recent purchases
* Cashier performance
* Alerts panel

## Products Page

Features:

* Product list
* Grid / table toggle
* Create product
* Search by name, SKU, barcode
* Filter by category, status, stock

Table columns:

* Image
* Product name
* SKU
* Barcode
* Category
* Cost price
* Sale price
* Stock
* Low stock threshold
* Status
* Actions

Actions:

* View
* Edit
* Disable / Delete
* Print label

Product form:

* Product name
* Category
* SKU
* Barcode
* QR code
* Unit
* Cost price
* Sale price
* Stock
* Low stock threshold
* Image upload placeholder
* Description
* Status

## Categories Page

Features:

* Category table
* Create / edit category modal
* Product count
* Active / inactive status
* Actions

## Inventory Page

Tabs:

* Stock Overview
* Stock In
* Stock Out
* Adjustment
* Damaged / Lost Stock
* Stock Movement History

Stock Movement table:

* Product
* Type
* Quantity
* Before
* After
* User
* Date
* Note

## Purchases Page

Features:

* Purchase list
* Create purchase
* Supplier filter
* Payment status filter
* Purchase status filter

Table columns:

* Purchase no
* Supplier
* Total
* Paid
* Balance
* Status
* Payment status
* Date
* Actions

Purchase form:

* Supplier
* Product items
* Quantity
* Cost
* Discount
* Total
* Paid amount
* Payment method
* Note

## Suppliers Page

Features:

* Supplier list
* Create supplier
* Search by name / phone

Supplier form:

* Name
* Phone
* Email
* Address
* Opening balance
* Status

Supplier detail:

* Purchase history
* Payment history
* Balance

## Customers Page

Features:

* Customer list
* Create customer

Customer form:

* Name
* Phone
* Email
* Address
* Credit / debt limit
* Notes
* Status

Customer detail:

* Purchase history
* Debt / credit history
* Payment history

## Cashier Management Page

Features:

* Cashier list
* Create cashier
* Search / filter by status

Table columns:

* Name
* Email / phone
* Status
* Sales today
* Last login
* Actions

Actions:

* Edit
* Disable / Enable
* Reset password
* View sales

Cashier form:

* Name
* Email
* Phone
* Password
* Permissions
* Status

## Sales Monitor Page

Features:

* Sales table
* Filters:

  * Date
  * Cashier
  * Payment method
  * Status
  * Receipt number

Table columns:

* Receipt number
* Cashier
* Customer
* Total
* Payment method
* Status
* Date
* Actions

Actions:

* View detail
* Reprint receipt
* Cancel sale
* Approve refund / return

## Reports Page

Tabs:

* Sales Report
* Stock Report
* Profit Report
* Purchase Report
* Supplier Report
* Customer Debt Report
* Cashier Report
* Daily Close Report
* Product Profit Report
* Damaged / Lost Stock Report

Each report:

* Date filter
* Export CSV button
* Summary cards
* Table
* Chart area

## Barcode / Labels Page

Features:

* Select products
* Label size
* Barcode / QR preview
* Print labels button
* Product code lookup

## Notifications Page

Features:

* Low stock alert settings
* Sale alert settings
* Purchase due alert
* Customer debt alert
* Telegram channel setup
* Notification logs

## Shop Settings Page

Fields:

* Shop profile
* Receipt setting
* Invoice format
* Tax setting
* Discount policy
* Currency
* Printer setting
* Telegram notification channel
* Language settings

---

# Cashier UI

Cashier is for fast selling only. UI must be simple, big, scanner-friendly, and keyboard-friendly.

## Cashier Navigation

* POS
* Hold Bills
* Receipts
* Sales History
* Stock Check
* Daily Close
* Profile

## POS Screen

Layout:

* Full screen POS layout
* Left side product search and product grid
* Right side cart and checkout
* Topbar with cashier name, shop name, shift status, date/time
* Barcode input always visible and focused
* Big buttons

POS features:

* Product search
* Barcode scan
* Product code lookup
* Quick category filters
* Quick product buttons
* Product cards:

  * Name
  * Price
  * Stock
  * Image placeholder
* Add to cart
* Quantity + / -
* Remove item
* Clear cart

## Cart Panel

Show:

* Cart item list
* Quantity controls
* Item discount if allowed
* Subtotal
* Tax
* Discount
* Grand total
* Customer select
* Hold bill button
* Checkout button

## Checkout Modal

Fields:

* Total amount
* Cash received
* Change calculation
* Payment method:

  * Cash
  * ABA / manual
  * Split payment
* Payment note
* Print receipt checkbox
* Complete sale button

## Receipt Screen

Receipt preview:

* Shop name
* Receipt number
* Cashier name
* Items
* Subtotal
* Discount
* Tax
* Total
* Payment method
* Cash received
* Change
* Print button
* Reprint button

## Hold Bills Page

Features:

* Held bills list
* Search by bill number / customer

Show:

* Hold bill number
* Customer
* Items count
* Total
* Cashier
* Time
* Status

Actions:

* Resume
* Cancel

Rule message:
Only HELD bills can be resumed. Completed or cancelled bills cannot be resumed.

## Daily Close Page

Features:

* Open shift card
* Close shift form
* Today cash sales
* ABA / manual sales
* Expected cash
* Counted cash
* Difference
* Notes
* Submit daily close button
* Daily close status

## Sales History Page

Features:

* Own sales only
* Filter today
* Filter by receipt number
* Sales table
* View detail
* Reprint own receipt

## Stock Check Page

Features:

* Search product
* Scan barcode
* Product stock result
* Read-only UI
* No edit buttons

## Customer Quick Add Modal

Fields:

* Name
* Phone
* Address optional
* Save and attach to sale

## Return / Refund Request UI

Fields:

* Select sale
* Select items
* Reason
* Request refund button

Status:

* Pending admin approval
* Approved
* Rejected

---

# Permission UI Rules

## ADMIN_MANAGER

Can manage:

* Shops
* Admins
* Subscriptions
* Locations
* System settings
* Reports
* Logs
* Notifications
* POS access

## ADMIN

Can manage only own shop:

* Products
* Categories
* Inventory
* Purchases
* Suppliers
* Customers
* Cashiers
* Sales monitor
* Reports
* Shop settings

## CASHIER

Can use:

* POS
* Cart
* Checkout
* Receipts
* Hold bills
* Daily close
* Own sales history
* Stock lookup only

Cashier must not see:

* Product create / edit / delete
* Supplier create / edit / delete
* Purchase management
* Shop settings
* Subscription
* User management
* Admin Manager pages

---

# Unauthorized Page

Create a 403 page:

* Title: 403 Access denied
* Message: You do not have permission to access this page.
* Button: Go back to dashboard

---

# Shared Components

Create reusable UI patterns:

* Sidebar
* Topbar
* StatCard
* DataTable
* SearchInput
* FilterBar
* ActionButton
* StatusBadge
* Modal
* ConfirmDialog
* FormCard
* ChartCard
* EmptyState
* LoadingState
* ReceiptPreview
* ProductCard
* CartPanel
* PaymentModal
* LanguageSwitch
* ThemeSwitcher preview only

---

# Responsive Design

## Desktop

* Fixed sidebar
* Topbar
* Dashboard grid
* POS two-column layout

## Tablet

* Collapsible sidebar
* Dashboard two-column
* POS cart slide-over

## Mobile

* Bottom navigation or drawer
* Cards stacked
* POS product grid two columns
* Cart as bottom sheet
* Big touch buttons

---

# Visual Style Rules

Use:

* Modern SaaS dashboard style
* Clean spacing
* Rounded cards
* Soft shadows
* Professional tables
* Clear role identity
* Khmer-friendly typography
* Large POS buttons for cashier
* Status colors:

  * Success: green
  * Warning: amber
  * Danger: red
  * Info: blue
  * Primary: role theme color

Avoid:

* Black and white default theme only
* Tiny POS buttons
* Confusing navigation
* Mixing Admin Manager and Cashier functions
* Showing management CRUD to cashier
* Making the app look like a small demo

---

# Output Expectation

Generate a complete clickable UI prototype with:

1. Login page
2. Admin Manager full UI pages
3. Admin full UI pages
4. Cashier full POS UI pages
5. Role-based dashboards
6. Role-based sidebars
7. Forms, tables, modals, cards
8. Mock data
9. Responsive layouts
10. Khmer / English label support where useful

Make it visually complete and ready to use as a UI reference for the real Kambuja-POS React project.
