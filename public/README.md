# FTC POS - Static HTML Prototypes

Complete set of static HTML pages for the FTC POS system.

## 📁 All Pages Created

### Authentication
- **login.html** - Login page with gradient design
  - Demo credentials: `admin` / `admin123`
  - Social login buttons (non-functional)

### Dashboard & Tables
- **index.html** - Main dashboard with table layout
  - Multiple floors (Ground, Floor 01, Take Away)
  - Table status indicators (free/busy)
  - Admin navigation menu

- **tables.html** - Table management interface
  - Add/Edit/Delete tables
  - Floor organization
  - Modal for adding new tables

### Sales & Products
- **sale.html** - POS sale interface
  - Product grid with categories
  - Shopping cart with live updates
  - Category filtering
  - Search functionality
  - Payment options (Cash/QR)

- **products.html** - Product list management
  - Product listing with images
  - Search functionality
  - Edit/Delete actions
  - Sticky header

- **categories.html** - Category management
  - Add/Edit categories
  - Enable/Disable categories
  - Modal dialogs

### Reports
- **reports.html** - Sales reports
  - Invoice view
  - Product view
  - Date range filters
  - User filters
  - Payment method filters
  - Export options (Excel, Print)
  - Expandable invoice details

## 🚀 How to Use

1. **Open any HTML file directly in your browser**
   - No server required
   - Pure HTML/CSS/JavaScript
   - Works offline

2. **Demo Login**
   - Username: `admin`
   - Password: `admin123`

3. **Navigation**
   - All pages are linked together
   - Use browser back button or navigation links

## ✨ Features

### Working Features
✅ Responsive design (mobile, tablet, desktop)
✅ Bootstrap 5 styling
✅ Interactive UI elements
✅ Category filtering (sale page)
✅ Search functionality (sale page)
✅ Shopping cart with add/remove (sale page)
✅ Modal dialogs
✅ Collapsible sections
✅ Print functionality (all pages)
✅ Print-friendly layouts

### Demo/Static Features
⚠️ Login authentication (demo only)
⚠️ Add to cart (localStorage, not persistent)
⚠️ All forms (no backend)
⚠️ All buttons (alert messages only)

## 📋 Page Details

### login.html
- Beautiful gradient design
- Two-column layout
- Form validation
- Demo authentication

### index.html
- Table grid layout
- Floor sections
- Status badges (free/busy)
- Quick action buttons
- Admin menu

### tables.html
- Table management
- Floor grouping
- Add/Edit modals
- Capacity settings

### sale.html
- Product grid with images
- Category sidebar
- Live shopping cart
- Real-time totals
- Search & filter
- Payment form

### products.html
- Product listing
- Image thumbnails
- Price display (USD/KHR)
- Search bar
- Sticky header
- Edit/Delete actions

### categories.html
- Category list
- Add/Edit modals
- Status badges
- Enable/Disable toggle

### reports.html
- Date range filters
- User filters
- Payment method filters
- Invoice/Product views
- Expandable details
- Export buttons
- Print-friendly layout

## 🎨 Design Features

- **Color Scheme**: Purple-blue gradient (#5b00e5 → #007bff)
- **Typography**: System fonts, Khmer support
- **Icons**: Bootstrap Icons
- **Layout**: Responsive grid system
- **Components**: Cards, badges, modals, forms

## ⚠️ Important Notes

### These are STATIC prototypes:
- ❌ No real database connection
- ❌ No actual authentication
- ❌ No data persistence
- ❌ No server-side processing
- ✅ For design/UI testing only

### For the REAL PHP application:
1. Import database: `full_fixed.sql`
2. Access via: `http://localhost/ftc-pos/public/`
3. Real authentication and data handling

## 🔧 Customization

All pages use:
- Bootstrap 5.3.3 CDN
- Bootstrap Icons CDN
- Inline CSS for custom styles
- Vanilla JavaScript (no frameworks)

To customize:
1. Edit HTML files directly
2. Modify inline `<style>` sections
3. Update JavaScript in `<script>` sections

## 📱 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 🖨️ Print Support

All pages include print functionality:
- Click the 🖨️ Print button in the navigation bar
- Or use Ctrl+P / Cmd+P
- Print-friendly CSS hides navigation, buttons, and forms
- Clean layout optimized for paper/PDF export
- Works on all pages: products, categories, tables, reports

## 💡 Use Cases

✅ Client presentations
✅ UI/UX testing
✅ Design approval
✅ Prototype demonstrations
✅ Training materials
✅ Documentation

## 📞 Support

For the real PHP application setup:
- Check `SETUP_INSTRUCTIONS.txt`
- Import `full_fixed.sql` to MySQL
- Configure database in `config.php`
- Access via Laragon/XAMPP

---

**Created**: February 2026  
**Version**: 1.0  
**Framework**: Bootstrap 5.3.3  
**Language**: HTML5, CSS3, JavaScript ES6
