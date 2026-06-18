# FTC POS - Static HTML Prototypes

## Created Files

I've created static HTML versions of your PHP pages for design/prototype purposes:

### 1. `html/login.html`
- Beautiful login page with gradient design
- Demo credentials: admin/admin123
- Social login buttons (non-functional)
- Responsive design

### 2. `html/index.html`
- Main dashboard showing table layout
- Multiple floors (Ground, Floor 01, Take Away)
- Table status indicators (free/busy)
- Admin navigation menu
- Clickable table cards

### 3. `html/tables.html`
- Table management interface
- Add/Edit/Delete tables
- Floor organization
- Modal for adding new tables

## How to Use

1. Open any HTML file directly in your browser
2. No server required - pure HTML/CSS/JavaScript
3. Demo login: username=`admin`, password=`admin123`

## Important Notes

⚠️ **These are STATIC prototypes only:**
- No real database connection
- No actual authentication
- No data persistence
- For design/UI testing only

⚠️ **Your PHP application still needs:**
- Database setup (import full_fixed.sql)
- Access via: `http://localhost/ftc-pos/public/`
- Real authentication and data handling

## Next Steps

If you want the PHP version to work:
1. Import database: Use phpMyAdmin at `http://localhost/phpmyadmin`
2. Import file: `full_fixed.sql`
3. Access: `http://localhost/ftc-pos/public/login.php`
4. Login: admin/admin123

## What You Can Do With HTML Files

✅ Test UI/UX design
✅ Show to clients for approval
✅ Test responsive layout
✅ Prototype new features
✅ Create mockups

❌ Cannot handle real transactions
❌ Cannot store data
❌ Cannot connect to database
❌ Cannot handle user sessions
