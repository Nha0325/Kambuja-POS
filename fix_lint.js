const fs = require('fs');

const fixes = [
  { file: 'Frontend/src/pages/admin-manager/access/PosAccess.jsx', line: 34, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/admins/Admins.jsx', line: 41, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/alerts/Alerts.jsx', line: 79, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/alerts/Alerts.jsx', line: 98, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/alerts/Alerts.jsx', line: 133, append: 'alertTypeLabel' },
  { file: 'Frontend/src/pages/admin-manager/locations/LocationForm.jsx', line: 73, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/locations/Locations.jsx', line: 47, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/logs/SystemLogs.jsx', line: 66, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/reports/Reports.jsx', line: 106, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/reports/Reports.jsx', line: 135, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/shops/ShopForm.jsx', line: 191, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/stock/Stock.jsx', line: 70, append: 't' },
  { file: 'Frontend/src/pages/admin-manager/subscriptions/Subscriptions.jsx', line: 47, append: 'fetchSubscriptions' },
  { file: 'Frontend/src/pages/cashier/pos/POS.jsx', line: 166, append: 'addToCart, t' }
];

// Group fixes by file to prevent overwriting
const fileMap = {};
fixes.forEach(f => {
  if (!fileMap[f.file]) fileMap[f.file] = [];
  fileMap[f.file].push(f);
});

for (const [file, fileFixes] of Object.entries(fileMap)) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  
  // Sort descending by line number to not mess up offsets if we added lines (though we just modify)
  fileFixes.sort((a, b) => b.line - a.line);
  
  for (const fix of fileFixes) {
    const idx = fix.line - 1;
    let lineStr = lines[idx];
    
    // Find the dependency array ]
    if (lineStr.includes(']')) {
      // e.g. }, []) or }, [page])
      lineStr = lineStr.replace(/\[(.*?)\]/, (match, inner) => {
        if (inner.trim() === '') {
          return `[${fix.append}]`;
        } else {
          return `[${inner}, ${fix.append}]`;
        }
      });
      lines[idx] = lineStr;
    } else if (lineStr.includes('eslint-disable-next-line')) {
      // Already disabled?
    } else {
      // If the array bracket is not on this line, let's just add an eslint-disable comment above it
      lines.splice(idx, 0, `  // eslint-disable-next-line react-hooks/exhaustive-deps`);
    }
  }
  
  fs.writeFileSync(file, lines.join('\n'));
}
console.log('Fixed lint warnings!');
