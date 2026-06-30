បាន។ Website hacking / pentesting tools មានច្រើន តែបែងចែកតាម phase ទើបងាយយល់។ ប្រើតែ website u own / localhost / lab / staging។ OWASP WSTG ជា guideline សម្រាប់ web app និង web service security testing។

0. Main flow
1. Recon / Information Gathering
2. Port & Service Scan
3. Web Mapping / Crawling
4. Directory & File Discovery
5. Proxy / Request Analysis
6. Vulnerability Scan
7. Manual Vulnerability Test
8. API Security Test
9. Auth / Role / Session Test
10. File Upload Test
11. Dependency / Source Code Scan
12. Report + Fix + Retest
1. Recon / Information Gathering

រក info មុនថា website ប្រើ technology អ្វី។

Tools:
- Browser DevTools
- Wappalyzer
- WhatWeb
- BuiltWith
- httpx
- curl

Use for:

- Detect frontend/backend tech
- Check headers
- Check server response
- Check cookies
- Check status code
- Check redirect

For Kambuja POS:

Check:
- React/Vite frontend
- Express backend
- API base URL
- CORS
- Headers
- Cookies / JWT
2. DNS / Subdomain Discovery

ប្រើពេលមាន domain ផ្ទាល់ខ្លួន។

Tools:
- amass
- subfinder
- assetfinder
- dnsx
- dig
- nslookup

Use for:

- Find subdomains
- Check DNS record
- Check exposed admin panel
- Check api.domain.com

Example target structure:

pos.kambujapos.com
manager.kambujapos.com
api.kambujapos.com
3. Port & Service Scan

រក port/service ដែល server បើក។

Tools:
- nmap
- rustscan
- naabu

Use for:

- Open ports
- Service version
- HTTP/HTTPS
- SSH exposed
- Database exposed or not

Important check:

Good:
- 80/443 open
- SSH restricted
- Database not public

Bad:
- MongoDB public
- Redis public
- Admin panel exposed
- Debug port exposed
4. Web Crawling / URL Discovery

រក URL/page/API path ដែល website មាន។

Tools:
- ZAP spider
- Burp Suite crawler
- katana
- hakrawler
- gau
- waybackurls

Use for:

- Find pages
- Find API endpoints
- Find old URLs
- Find hidden frontend routes

For Kambuja POS:

/api/v1/auth/signin
/api/v1/auth/me
/api/v1/products
/api/v1/sales
/api/v1/reports
/api/v1/users
/api/v1/shops
5. Directory / File Discovery

រក hidden folder/file ដូចជា admin, backup, upload។

Tools:
- gobuster
- ffuf
- feroxbuster
- dirsearch
- dirb

Use for:

- /admin
- /backup
- /uploads
- /.env
- /api
- /config
- /old
- /test

Critical finding:

/.env accessible = Critical
/uploads executable = High
/backup.zip exposed = Critical
/admin public = High
6. Proxy / Request Analysis

មើល request/response រវាង browser និង backend។

Tools:
- Burp Suite
- OWASP ZAP
- mitmproxy
- Browser DevTools Network tab

OWASP ZAP official guide describes ZAP as a tool for security testing and a proxy-style tool for exploring/scanning applications.

Use for:

- Intercept login request
- Check JWT token
- Check cookie flags
- Modify role manually
- Repeat API request
- Test missing authorization

For Kambuja POS:

Cashier token → try create product
Admin token → try access another shop data
Admin Manager token → try edit stock
No token → try access private API

Expected:

No token = 401
Wrong role = 403
Wrong shop = 403 or 404
Invalid input = 400
7. Vulnerability Scanner

Auto scan ដើម្បីរក issue ទូទៅ។

Tools:
- OWASP ZAP
- Nuclei
- Nikto
- Wapiti

Nuclei is a vulnerability scanner using YAML templates for modern apps, infrastructure, cloud platforms, and networks.

Use for:

- Common misconfiguration
- Exposed files
- Weak headers
- Known CVE check
- Default pages
- Bad TLS config

Use carefully:

Local/staging = OK
Production = backup first, low rate only
Other people's website = No
8. SQL Injection Test

Tool famous:

- sqlmap

sqlmap is an open-source penetration testing tool that automates detecting and exploiting SQL injection flaws.

Use for:

- Check SQL injection risk
- Test query parameter
- Test form parameter
- Test API body parameter

For Kambuja POS: u use MongoDB, so normal SQL injection is less direct than MySQL/PostgreSQL, but still test:

- NoSQL injection
- MongoDB query injection
- Bad filter object
- Unsafe search query
- Unsafe JSON body

Important fix:

- Validate input
- Reject object where string expected
- Use schema validation
- Do not pass req.body directly into Mongo query
- Use Mongoose validation
9. XSS Test

Cross-site scripting test.

Tools:
- Burp Suite
- ZAP
- Dalfox
- XSStrike

Check fields:

- Product name
- Customer name
- Supplier name
- Category name
- Description
- Search box
- Notes

Fix:

- Escape output
- Sanitize HTML
- Do not render user input with dangerouslySetInnerHTML
- Validate text length/type
10. API Security Test

For backend API.

Tools:
- Postman
- Insomnia
- curl
- Burp Suite
- ZAP

Test:

- Missing token
- Expired token
- Wrong role
- Wrong shopId
- Invalid ObjectId
- Mass assignment
- IDOR
- Rate limit

IDOR example concept:

Admin Shop A must not read/edit Shop B product by changing product ID.

For Kambuja POS this is priority:

- shopId isolation
- role guard
- ownership check
- cashier restriction
- admin manager read-only rule
11. Auth / Password / Session Test
Tools:
- Burp Suite
- ZAP
- jwt.io decoder
- jwt-cli
- Postman

Check:

- Password hashed with bcrypt
- JWT_SECRET strong
- Token expires
- Logout clears token
- Failed login rate limit
- Generic login error
- No role trust from frontend

Bad pattern:

if (req.body.role === "ADMIN") allow

Good pattern:

Role must come from verified JWT/user record, not frontend input.
12. Password Attack Testing

Only for lab / own test account.

Tools:
- Hydra
- Burp Intruder
- ffuf

Use for:

- Check weak password policy
- Check rate limit
- Check account lockout
- Check brute force protection

Do not use on real accounts that are not yours.

Fix:

- Rate limit login
- Lock account after repeated failures
- CAPTCHA after many attempts
- Strong password rule
- Audit log failed login
13. File Upload Testing

For product image upload.

Tools:
- Burp Suite
- ZAP
- exiftool
- file command

Check:

- Upload .jpg/.png/.webp only
- Reject .php/.js/.html/.svg/.exe/.sh
- File size limit
- Rename file
- Store safe path
- Do not expose local server path

For Kambuja POS:

Product image upload must not accept script files.
14. Security Headers / TLS
Tools:
- curl
- testssl.sh
- securityheaders.com
- Mozilla Observatory

Check headers:

Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Strict-Transport-Security
X-Frame-Options or CSP frame-ancestors

For Express:

Tool/package:
- helmet
15. Source Code Security Scan

Find bug from code, not only running website.

Tools:
- Semgrep
- ESLint security plugins
- SonarQube
- CodeQL

Check:

- Unsafe query
- Hardcoded secret
- Weak crypto
- Insecure upload
- Missing auth guard
- Dangerous eval
16. Dependency Scan

Check npm package vulnerability.

Tools:
- npm audit
- pnpm audit
- yarn audit
- Snyk
- Dependabot
- Renovate

For Kambuja POS:

Backend:
npm audit

Frontend admin-manager:
npm audit

Frontend admin-cashier:
npm audit
17. Secret Scan

Find leaked keys/passwords.

Tools:
- Gitleaks
- TruffleHog
- GitHub secret scanning

Check:

.env
MONGODB_URI
JWT_SECRET
API_KEY
Railway token
GitHub token
SSH private key

Critical:

Never push .env
Never push private key
Never push MongoDB password
18. Container / Server Scan

If using Docker/VPS.

Tools:
- Trivy
- Grype
- Docker Scout
- Lynis

Check:

- Vulnerable image
- Exposed ports
- Root user container
- Weak VPS config
- Old packages
19. CMS Specific Tools

Only if website uses CMS.

WordPress:
- WPScan

Drupal:
- droopescan

Joomla:
- joomscan

For Kambuja POS React + Express: normally not needed unless u use WordPress/CMS.

20. Wireless / Network Packet Tools

For network lab, not website direct.

Tools:
- Wireshark
- tcpdump
- tshark

Use for:

- See DNS request
- See HTTP request
- Debug API traffic
- Check plaintext traffic

If HTTPS is correct, sensitive data should not be readable in plain text.

21. Wordlists

Used with directory/subdomain tools.

Tools/data:
- SecLists
- custom wordlist

Use for:

- directory discovery
- parameter discovery
- login test in lab
- API path discovery
22. Report Tools
Tools:
- Markdown
- CherryTree
- Obsidian
- Dradis
- Faraday

Report format:

Finding:
Risk:
Affected URL:
Role used:
Steps:
Expected:
Actual:
Impact:
Fix:
Retest:
Best tool list for u now

For Kambuja POS / own website, learn in this order:

1. Browser DevTools
2. curl
3. Postman
4. Burp Suite
5. OWASP ZAP
6. Nmap
7. Gobuster or ffuf
8. Nuclei
9. Gitleaks
10. npm audit
11. Semgrep
12. Trivy
13. sqlmap concept only
14. Wireshark
Tool map by vulnerability
SQL Injection:
- sqlmap
- Burp Suite
- ZAP

NoSQL Injection:
- Burp Suite
- Postman
- manual JSON test

XSS:
- Burp Suite
- ZAP
- Dalfox
- XSStrike

Broken Access Control:
- Burp Suite
- Postman
- curl

IDOR:
- Burp Suite
- Postman
- curl

File Upload:
- Burp Suite
- ZAP
- file
- exiftool

Weak Headers:
- curl
- ZAP
- securityheaders.com

Dependency Risk:
- npm audit
- Snyk
- Dependabot

Secret Leak:
- Gitleaks
- TruffleHog

Vulnerability Scan:
- ZAP
- Nuclei
- Nikto

Port Scan:
- Nmap
- Rustscan
- Naabu

Subdomain:
- Subfinder
- Amass
- Assetfinder

Directory:
- Gobuster
- ffuf
- Feroxbuster
- Dirsearch
- Dirb
For Kambuja POS, priority testing
Critical:
1. .env leak
2. JWT_SECRET leak
3. MongoDB URI leak
4. Cashier can create/edit/delete product
5. Admin Manager can modify shop inventory
6. Admin Shop A can access Shop B data
7. Product upload accepts dangerous file
8. API allows request without token
9. Frontend-only permission check
10. Error leaks database/server detail

Correct result:

No token              → 401
Wrong role            → 403
Wrong shop data       → 403 or 404
Invalid input         → 400
Duplicate barcode     → 409
Server bug            → 500 generic message only
Safe lab stack
Main OS:
- Ubuntu

Lab:
- Docker
- OWASP Juice Shop
- DVWA
- WebGoat
- Metasploitable
- Kali Linux VM or AthenaOS VM

Website own:
- Kambuja POS localhost/staging
Short meaning
sqlmap = SQL injection test
nmap = port/service scan
gobuster/ffuf = hidden path scan
Burp Suite = intercept and manual web test
OWASP ZAP = auto/passive web security scan
Nuclei = template vulnerability scanner
Postman/curl = API test
Gitleaks = secret leak scan
npm audit = package vulnerability scan
Semgrep = source code security scan
Wireshark = packet analysis

Use tools to find bug → prove safely → fix → retest, not to attack unknown websites.