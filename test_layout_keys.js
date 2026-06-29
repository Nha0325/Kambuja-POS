const fs = require('fs');
const kmData = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));
const enData = JSON.parse(fs.readFileSync('Frontend/src/locales/en.json', 'utf8'));

const keys = [
  "create_new_supplier", "edit_supplier", "suppliers", 
  "create_new_category", "edit_category", "categories", 
  "print_barcode_qr_label", "create_new_product", "edit_product", "products", 
  "receive_stock", "stock_adjustment", "stock_overview", 
  "create_purchase", "purchases", "create_new_cashier", 
  "edit_cashier", "cashiers", "view_all_sales", 
  "sales_report", "stock_report", "notification_channels", 
  "notification_logs", "shop_settings", "shop_admin"
];

let allExist = true;
for (const k of keys) {
  if (!enData[k]) { console.log(`Missing in EN: ${k}`); allExist = false; }
  if (!kmData[k]) { console.log(`Missing in KM: ${k}`); allExist = false; }
}
if (allExist) console.log("All keys exist in both locales!");
