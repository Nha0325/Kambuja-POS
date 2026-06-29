const fs = require('fs');

const keys = {
  "search_products_or_invoices": { en: "Search products or invoices...", km: "ស្វែងរកផលិតផល ឬវិក្កយបត្រ..." },
  "searching": { en: "Searching...", km: "កំពុងស្វែងរក..." },
  "invoices": { en: "INVOICES", km: "វិក្កយបត្រ" },
  "mark_all_as_read": { en: "Mark all as read", km: "សម្គាល់ថាបានអានទាំងអស់" },
  "loading_notifications": { en: "Loading notifications...", km: "កំពុងទាញយកការជូនដំណឹង..." },
  "no_new_notifications": { en: "No new notifications", km: "គ្មានការជូនដំណឹងថ្មីទេ" },
  "view_all_notifications": { en: "View all notifications", km: "មើលការជូនដំណឹងទាំងអស់" },
  "language": { en: "Language", km: "ភាសា" },
  "admin_manager": { en: "Admin Manager", km: "អ្នកគ្រប់គ្រង" } // Just in case it wasn't there
};

const kmData = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));
const enData = JSON.parse(fs.readFileSync('Frontend/src/locales/en.json', 'utf8'));

for (const [key, value] of Object.entries(keys)) {
  if (!enData[key]) enData[key] = value.en;
  if (!kmData[key]) kmData[key] = value.km;
}

fs.writeFileSync('Frontend/src/locales/km.json', JSON.stringify(kmData, null, 2));
fs.writeFileSync('Frontend/src/locales/en.json', JSON.stringify(enData, null, 2));
