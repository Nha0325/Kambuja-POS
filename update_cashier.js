const fs = require('fs');
const file = '/home/star/Desktop/Kambuja-POS/Frontend/src/pages/admin/user/CashierEdit.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const res = await update\(route\.id, \{([\s\S]*?)role,([\s\S]*?)\}\);/,
  `const payload = {
        username,
        email,
        role,
      };
      if (password) {
        payload.password = password;
      }
      const res = await update(route.id, payload);`
);

content = content.replace(
  /<div className="mb-3">\s*<label className="block">Email\*\<\/label>\s*<input\s*required\s*value=\{email\}\s*onChange=\{\(e\) => setEmail\(e\.target\.value\)\}\s*type="email"\s*className="input input-bordered w-full"\s*placeholder="Enter email"\s*\/>\s*<\/div>/,
  `<div className="mb-3">
            <label className="block">Email*</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="input input-bordered w-full"
              placeholder="Enter email"
            />
          </div>

          <div className="mb-4">
            <label className="block">Password (Optional)</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input input-bordered w-full"
              placeholder="Enter new password (min 6 chars)"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank if you don't want to change the password.</p>
          </div>`
);

fs.writeFileSync(file, content);
console.log('done');
