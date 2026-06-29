const fs = require('fs');
const km = JSON.parse(fs.readFileSync('Frontend/src/locales/km.json', 'utf8'));
console.log('km.create_admin_owner:', km['create_admin_owner']);
