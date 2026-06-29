const fs = require('fs');
const km = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('Frontend/src/locales/en.json', 'utf8'));

const keysToCheck = [
  'all_shops', 'create_shop', 'admin_management', 'create_admin_account'
];

keysToCheck.forEach(key => {
  console.log(`km.${key}:`, km[key]);
  console.log(`en.${key}:`, en[key]);
});
