# FTC POS - Complete HTML Pages Index

## 📑 All Available Pages

### 🔐 Authentication
1. **login.html** - Login page
   - Demo credentials: admin/admin123
   - Beautiful gradient design
   - Social login buttons

### 🏠 Dashboard & Main
2. **index.html** - Main dashboard
   - Table layout by floors
   - Status indicators (free/busy)
   - Quick action menu
   - Admin navigation

### 🍽️ Products & Menu
3. **products.html** - Product list
   - Search functionality
   - Edit/Delete actions
   - Print support
   - Image thumbnails

4. **add_product.html** - Add new product
   - Auto-calculate USD ↔ KHR
   - Image upload with preview
   - Category selection
   - Stock management

5. **edit_product.html** - Edit existing product
   - Pre-filled form
   - Image replacement
   - Delete option
   - Auto-calculate prices

6. **categories.html** - Category management
   - Add/Edit/Disable categories
   - Modal dialogs
   - Print support

### 💰 Sales & POS
7. **sale.html** - POS sale interface
   - Product grid with images
   - Live shopping cart
   - Category filtering
   - Search functionality
   - Payment options (Cash/QR)
   - Real-time totals

### 🪑 Tables & Floors
8. **tables.html** - Table management
   - Floor grouping
   - Add/Edit/Delete tables
   - Capacity settings
   - Status management
   - Print support

### 📊 Reports
9. **reports.html** - Sales reports
   - Date range filters
   - User filters
   - Payment method filters
   - Invoice/Product views
   - Expandable details
   - Export options (Excel, Print)
   - Bulk delete

### 👥 Users & Settings
10. **users.html** - User management
    - Add/Edit users
    - Role assignment (Admin/Sale)
    - Password reset
    - Enable/Disable users
    - Print support

11. **settings.html** - System settings
    - Company information
    - Currency exchange rate
    - Receipt settings
    - Logo & QR code upload
    - System information
    - Backup options
    - Danger zone (reset/clear data)

## 🎯 Quick Navigation

### For Customers/Staff
- Start: **login.html** → **index.html** → **sale.html**

### For Managers
- Products: **products.html** → **add_product.html** / **edit_product.html**
- Categories: **categories.html**
- Tables: **tables.html**
- Reports: **reports.html**

### For Admins
- Users: **users.html**
- Settings: **settings.html**
- All above pages

## ✨ Features Summary

### All Pages Include:
✅ Responsive design (mobile/tablet/desktop)
✅ Bootstrap 5 styling
✅ Khmer language support
✅ Clean, modern UI
✅ Navigation links

### Pages with Print:
✅ products.html
✅ categories.html
✅ tables.html
✅ reports.html
✅ users.html

### Pages with Forms:
✅ login.html
✅ add_product.html
✅ edit_product.html
✅ categories.html (modals)
✅ tables.html (modals)
✅ users.html (modals)
✅ settings.html
✅ sale.html

### Pages with Live Updates:
✅ sale.html (cart)
✅ add_product.html (price calculation)
✅ edit_product.html (price calculation)

## 📱 Mobile Support

All pages are fully responsive:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🖨️ Print Support

Pages with print functionality:
- Click 🖨️ Print button
- Or press Ctrl+P / Cmd+P
- Hides navigation, buttons, forms
- Shows clean data tables

## 🎨 Design System

**Colors:**
- Primary: Purple-blue gradient (#5b00e5 → #007bff)
- Success: Green (#198754)
- Warning: Yellow (#ffc107)
- Danger: Red (#dc3545)
- Info: Cyan (#0dcaf0)

**Typography:**
- System fonts
- Khmer Unicode support
- Bootstrap Icons

**Components:**
- Cards
- Badges
- Modals
- Forms
- Tables
- Buttons
- Alerts

## 🔗 Page Relationships

```
login.html
    ↓
index.html (Dashboard)
    ├── sale.html (Click table)
    ├── products.html
    │   ├── add_product.html
    │   └── edit_product.html
    ├── categories.html
    ├── tables.html
    ├── reports.html
    ├── users.html
    └── settings.html
```

## 📦 File Structure

```
html/
├── login.html              # Authentication
├── index.html              # Dashboard
├── sale.html               # POS Interface
├── products.html           # Product List
├── add_product.html        # Add Product
├── edit_product.html       # Edit Product
├── categories.html         # Categories
├── tables.html             # Table Management
├── reports.html            # Sales Reports
├── users.html              # User Management
├── settings.html           # System Settings
├── README.md               # Documentation
├── PRINT_GUIDE.md          # Print Guide
└── INDEX.md                # This file
```

## 🚀 Getting Started

1. Open **login.html** in your browser
2. Login with: admin / admin123
3. Navigate to any page from the dashboard
4. All features work in demo mode

## ⚠️ Important Notes

**These are STATIC prototypes:**
- ❌ No real database
- ❌ No actual authentication
- ❌ No data persistence
- ✅ For design/UI testing only

**For REAL PHP application:**
- Import `full_fixed.sql` to MySQL
- Access via `http://localhost/ftc-pos/public/`
- Real authentication and data handling

## 📞 Support

For questions or issues:
- Check README.md for details
- Check PRINT_GUIDE.md for printing
- Review PHP files for real implementation

---

**Total Pages**: 11 HTML files  
**Created**: February 2026  
**Version**: 1.0  
**Framework**: Bootstrap 5.3.3  
**Status**: Complete ✅
