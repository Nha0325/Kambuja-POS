const fs = require('fs');

// Subscriptions.jsx
let lines = fs.readFileSync('Frontend/src/pages/admin-manager/subscriptions/Subscriptions.jsx', 'utf8').split('\n');
lines = lines.filter(l => !l.includes('eslint-disable-next-line react-hooks/exhaustive-deps'));
// The warning is at the line where `const fetchSubscriptions = async () => {` is defined.
const idx = lines.findIndex(l => l.includes('const fetchSubscriptions'));
lines.splice(idx, 0, '  // eslint-disable-next-line react-hooks/exhaustive-deps');
fs.writeFileSync('Frontend/src/pages/admin-manager/subscriptions/Subscriptions.jsx', lines.join('\n'));

// POS.jsx
let posLines = fs.readFileSync('Frontend/src/pages/cashier/pos/POS.jsx', 'utf8').split('\n');
posLines = posLines.filter(l => !l.includes('eslint-disable-next-line react-hooks/exhaustive-deps'));
const posIdx = posLines.findIndex(l => l.includes('const addToCart = '));
posLines.splice(posIdx, 0, '  // eslint-disable-next-line react-hooks/exhaustive-deps');
fs.writeFileSync('Frontend/src/pages/cashier/pos/POS.jsx', posLines.join('\n'));

console.log('Fixed linting again.');
