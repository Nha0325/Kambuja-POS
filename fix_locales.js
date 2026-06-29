const fs = require('fs');

const kmPath = 'Frontend/src/locales/km.json';
const km = JSON.parse(fs.readFileSync(kmPath, 'utf8'));
km['all_shops'] = 'បញ្ជីហាងទាំងអស់';
km['create_shop'] = 'បង្កើតហាង';
km['admin_management'] = 'ការគ្រប់គ្រងអ្នកគ្រប់គ្រង';
km['create_admin_account'] = 'បង្កើតគណនីម្ចាស់ហាង';
fs.writeFileSync(kmPath, JSON.stringify(km, null, 2));

const enPath = 'Frontend/src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
en['all_shops'] = 'All Shops';
en['create_shop'] = 'Create Shop';
en['admin_management'] = 'Admin Management';
en['create_admin_account'] = 'Create Admin Account';
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));

console.log('Locales updated.');
