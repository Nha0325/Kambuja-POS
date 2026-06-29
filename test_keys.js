const fs = require('fs');
const kmData = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));

const keys = [
  "create_new_supplier", "edit_supplier", "create_new_category", "edit_category", 
  "print_barcode_qr_label", "create_new_product", "edit_product", "create_purchase", 
  "create_new_cashier", "edit_cashier", "view_all_sales", "notification_channels", "notification_logs"
];

for (const k of keys) {
  console.log(k, "=>", kmData[k]);
}
