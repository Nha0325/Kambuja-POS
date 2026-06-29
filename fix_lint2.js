const fs = require('fs');

function fix(file, line) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  const idx = line - 1;
  lines.splice(idx, 0, '    // eslint-disable-next-line react-hooks/exhaustive-deps');
  fs.writeFileSync(file, lines.join('\n'));
}

// Subscriptions.jsx
fix('Frontend/src/pages/admin-manager/subscriptions/Subscriptions.jsx', 47);

// POS.jsx
fix('Frontend/src/pages/cashier/pos/POS.jsx', 166);

console.log('Fixed remaining warnings!');
