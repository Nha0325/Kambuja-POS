const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'Frontend/src/locales/en.json');
const kmPath = path.join(__dirname, 'Frontend/src/locales/km.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const kmData = JSON.parse(fs.readFileSync(kmPath, 'utf8'));

// Read all unique keys from /tmp/admin_translations.txt
const keysRaw = fs.readFileSync('/tmp/admin_translations.txt', 'utf8').split('\n');
const keys = keysRaw
  .map(k => k.replace(/t\('([^']+)'\)/, '$1').trim())
  .filter(k => k && k !== 't' && !k.includes('(') && !k.includes(' '));

let enAdded = 0;
let kmAdded = 0;

for (const key of keys) {
  if (!enData[key]) {
    // Basic humanization for English: 'product_name' -> 'Product Name'
    const value = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    enData[key] = value;
    enAdded++;
  }
  if (!kmData[key]) {
    // Same for Khmer for now, user can tweak later or I will translate the major ones
    const value = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    kmData[key] = value;
    kmAdded++;
  }
}

// Ensure the specific divider is there if needed, but since it's an object it doesn't matter order.
// Let's just write them back nicely.
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(kmPath, JSON.stringify(kmData, null, 2));

console.log(`Added ${enAdded} keys to en.json and ${kmAdded} keys to km.json.`);
