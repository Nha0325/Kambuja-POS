# Print Functionality Guide

All HTML pages in the FTC POS system now include print functionality.

## 🖨️ How to Print

### Method 1: Print Button
- Look for the **🖨️ Print** button in the navigation bar
- Click it to open the print dialog
- Available on: products.html, categories.html, tables.html, reports.html

### Method 2: Keyboard Shortcut
- Press **Ctrl+P** (Windows/Linux) or **Cmd+P** (Mac)
- Works on all pages

### Method 3: Browser Menu
- Click browser menu → Print
- Or right-click → Print

## 📄 What Gets Printed

### Included in Print:
✅ Page title and headers
✅ Data tables
✅ Product lists
✅ Category lists
✅ Table layouts
✅ Report data
✅ Totals and summaries

### Hidden from Print:
❌ Navigation bars
❌ Action buttons (Edit, Delete, Add)
❌ Search forms
❌ Filter forms
❌ Sign Out buttons
❌ Back buttons
❌ Modal dialogs

## 📋 Page-Specific Print Features

### products.html
- Clean product list with images
- Prices in USD and KHR
- Quantity information
- No edit/delete buttons

### categories.html
- Category names
- Status badges
- Clean table layout
- No action buttons

### tables.html
- Table numbers
- Capacity information
- Status indicators
- Floor grouping
- No edit buttons

### reports.html
- Full report data
- Date ranges
- Totals
- Invoice details
- Expandable sections work in print
- No filter forms or delete buttons

### sale.html
- Product grid (if needed)
- Current cart items
- Totals
- Clean for kitchen/order printing

## 💡 Print Tips

### For Best Results:
1. **Landscape Mode**: Better for wide tables
   - Set in print dialog → Layout → Landscape

2. **Remove Headers/Footers**: Cleaner look
   - Set in print dialog → More settings → Headers and footers → Off

3. **Background Graphics**: Show badges and colors
   - Set in print dialog → More settings → Background graphics → On

4. **Margins**: Adjust for more content
   - Set in print dialog → More settings → Margins → Minimum

5. **Scale**: Fit more content
   - Set in print dialog → More settings → Scale → 80-90%

### Save as PDF:
1. Open print dialog (Ctrl+P / Cmd+P)
2. Select "Save as PDF" as printer
3. Click "Save"
4. Choose location and filename

## 🎨 Print Styling

All pages use CSS media queries for print:

```css
@media print {
  .no-print { display: none !important; }
  body { background: #fff !important; }
  .card { border: none !important; box-shadow: none !important; }
  .table-scroll { max-height: none !important; overflow: visible !important; }
}
```

This ensures:
- White background
- No shadows or borders
- All content visible (no scrolling)
- Clean, professional appearance

## 📱 Mobile Printing

Print works on mobile devices too:
- iOS: Share → Print
- Android: Menu → Print

## 🔧 Troubleshooting

### Problem: Buttons still showing
**Solution**: Make sure you're using the latest version of the HTML files

### Problem: Content cut off
**Solution**: 
- Try landscape mode
- Reduce scale to 80-90%
- Adjust margins to minimum

### Problem: No colors/badges
**Solution**: Enable "Background graphics" in print settings

### Problem: Multiple pages when expecting one
**Solution**: 
- Reduce scale
- Use landscape mode
- Adjust margins

## 📊 Print Examples

### Products List
- Perfect for inventory checks
- Shows all product details
- Clean table format

### Categories
- Quick reference sheet
- Status overview
- Compact layout

### Tables Management
- Floor plans
- Table status
- Capacity planning

### Reports
- Sales summaries
- Invoice details
- Financial records
- Date-stamped

## ✅ Browser Compatibility

Print functionality tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

---

**Last Updated**: February 2026  
**Version**: 1.0  
**All pages**: login.html, index.html, tables.html, sale.html, products.html, categories.html, reports.html
