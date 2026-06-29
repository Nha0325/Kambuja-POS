const fs = require('fs');
const km = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('Frontend/src/locales/en.json', 'utf8'));

console.log('km.all_shops:', km['all_shops']);
console.log('en.all_shops:', en['all_shops']);
console.log('km.create_shop:', km['create_shop']);
console.log('en.create_shop:', en['create_shop']);
console.log('km.admin_owners:', km['admin_owners']);
console.log('en.admin_owners:', en['admin_owners']);
