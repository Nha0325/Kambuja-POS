const fs = require('fs');

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to add `import { lazy } from 'react'` at the top if it's not there
  if (!content.includes("import { lazy }")) {
    content = 'import { lazy } from "react"\n' + content;
  }

  // Find all standard component imports (that are from '../pages/...' or '../components/...')
  // Example: import Home from "../pages/admin/dashboard"
  // Example: import { SupplierCreate, SupplierEdit, SupplierList } from "../pages/admin/supplier"
  
  const importRegex = /^import\s+(?:\{([^}]+)\}|([A-Za-z0-9_]+))\s+from\s+["'](\.\.\/(?:pages|components)[^"']+)["']/gm;
  
  let match;
  let replacements = [];

  while ((match = importRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const destructured = match[1];
    const defaultImport = match[2];
    const path = match[3];

    let newCode = "";

    if (defaultImport) {
      // e.g. import Home from "../pages/admin/dashboard"
      // -> const Home = lazy(() => import("../pages/admin/dashboard"))
      newCode = `const ${defaultImport} = lazy(() => import("${path}"))`;
    } else if (destructured) {
      // e.g. import { Inventory, StockAdjustment } from "../pages/admin/inventory"
      // -> 
      // const Inventory = lazy(() => import("../pages/admin/inventory").then(module => ({ default: module.Inventory })))
      const names = destructured.split(',').map(s => s.trim()).filter(Boolean);
      const lines = names.map(name => {
        return `const ${name} = lazy(() => import("${path}").then(module => ({ default: module.${name} })))`;
      });
      newCode = lines.join('\n');
    }
    
    if (newCode) {
      replacements.push({ oldStr: fullMatch, newStr: newCode });
    }
  }

  // Apply replacements
  for (const { oldStr, newStr } of replacements) {
    content = content.replace(oldStr, newStr);
  }

  fs.writeFileSync(filePath, content);
}

const files = [
  'Frontend/src/routes/admin.routes.jsx',
  'Frontend/src/routes/admin-manager.routes.jsx',
  'Frontend/src/routes/cashier.routes.jsx',
  'Frontend/src/routes/auth.routes.jsx',
  'Frontend/src/routes/index.jsx'
];

files.forEach(refactorFile);
console.log('Routes refactored to use React.lazy!');
