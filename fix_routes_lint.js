const fs = require('fs');

const files = [
  'Frontend/src/routes/admin.routes.jsx',
  'Frontend/src/routes/admin-manager.routes.jsx',
  'Frontend/src/routes/cashier.routes.jsx',
  'Frontend/src/routes/auth.routes.jsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('eslint-disable react-refresh/only-export-components')) {
    content = '/* eslint-disable react-refresh/only-export-components */\n' + content;
    fs.writeFileSync(file, content);
  }
}
console.log('Disabled react-refresh/only-export-components on route files!');
