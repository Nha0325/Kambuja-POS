ខាងក្រោមនេះជា របៀបដែល hacker អាចគិតវាយប្រហារ POS / React / Node / MongoDB project និង របៀបការពារ។ ប្រើសម្រាប់ test project ខ្លួនឯងប៉ុណ្ណោះ។

1. Hacker មើល request/API មុនគេ

ពេលអ្នក click login, create product, sell product, view report, browser ផ្ញើ request ទៅ backend។

Frontend React → Backend API → MongoDB

Hacker មិនត្រូវការមើល button ក្នុង UI ទេ។ គេអាច call API ផ្ទាល់។

ឧទាហរណ៍ POS របស់អ្នកអាចមាន API ដូចជា៖

POST /api/v1/auth/signin
GET /api/v1/products
POST /api/v1/products
DELETE /api/v1/products/:id
POST /api/v1/sales
GET /api/v1/reports/sales

បញ្ហាធំ៖
បើ backend មិន check role ឲ្យត្រឹមត្រូវ Cashier អាច call API របស់ Admin បាន។

ការពារ៖
គ្រប់ API សំខាន់ត្រូវមាន៖

1. Check token
2. Check role
3. Validate input
4. Check shop ownership
2. Role bypass

នេះសំខាន់បំផុតសម្រាប់ POS របស់អ្នក។

Role មាន៖

ADMIN_MANAGER
ADMIN
CASHIER

Hacker ឬ Cashier អាចសាក call API ដែលខ្លួនមិនគួរប្រើបាន។

ឧទាហរណ៍ Cashier មិនគួរធ្វើបាន៖

Create admin
Delete product
Edit product price
View full report
View all shops
Change shop setting

ការពារ backend:

const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

ប្រើលើ route:

router.delete(
  "/products/:id",
  authGuard,
  requireRoles("ADMIN_MANAGER", "ADMIN"),
  productController.deleteProduct
);

router.get(
  "/reports/sales",
  authGuard,
  requireRoles("ADMIN_MANAGER", "ADMIN"),
  reportController.getSalesReport
);

សម្រាប់ Cashier:

router.post(
  "/sales",
  authGuard,
  requireRoles("ADMIN", "CASHIER"),
  saleController.createSale
);

ច្បាប់ត្រឹមត្រូវ៖

Frontend hide menu = មិនគ្រប់គ្រាន់
Backend block role = ចាំបាច់
3. Price manipulation

នេះគ្រោះថ្នាក់ខ្លាំងសម្រាប់ POS។

បើ frontend ផ្ញើ price ទៅ backend ហើយ backend ជឿ price នោះ hacker អាចកែតម្លៃបាន។

មិនត្រូវធ្វើបែបនេះ៖

{
  "productId": "123",
  "qty": 1,
  "price": 1
}

បញ្ហា៖
Cashier ឬ hacker អាចកែ price ពី 5000៛ ទៅ 1៛។

ការពារ៖
Backend ត្រូវយក price ពី database មិនមែនយកពី frontend។

const product = await Product.findById(item.productId);

if (!product) {
  return res.status(404).json({ message: "Product not found" });
}

const unitPrice = product.price;
const lineTotal = unitPrice * item.qty;

Frontend ផ្ញើតែនេះគ្រប់គ្រាន់៖

{
  "productId": "123",
  "qty": 2
}

Backend គណនាខ្លួនឯង៖

price = from database
subtotal = price × qty
total = backend calculate
stock = backend cut
4. Stock manipulation

Hacker អាចកែ quantity ក្នុង request។

ឧទាហរណ៍៖

{
  "productId": "123",
  "qty": 999999
}

បើ backend មិន check stock នឹងបង្កើត sale ខុស។

ការពារ៖

if (item.qty <= 0) {
  return res.status(400).json({ message: "Invalid quantity" });
}

if (product.stock < item.qty) {
  return res.status(400).json({ message: "Insufficient stock" });
}

ពេល sale success ត្រូវ cut stock នៅ backend:

product.stock -= item.qty;
await product.save();

ច្បាប់ត្រឹមត្រូវ៖

Stock មិនត្រូវ cut នៅ frontend
Stock ត្រូវ cut នៅ backend
Sale និង stock update គួរធ្វើក្នុង transaction
5. Shop ownership bypass

បើ system មានច្រើន shop, hacker អាចសាកយក product/shop ID របស់ហាងផ្សេង។

ឧទាហរណ៍៖

GET /api/v1/products?shopId=SHOP_OTHER

បញ្ហា៖
Admin ហាង A អាចមើល product ហាង B។

ការពារ៖
Backend មិនត្រូវជឿ shopId ពី frontend សម្រាប់ user ធម្មតា។ ត្រូវយក shopId ពី token/user session។

const products = await Product.find({
  shopId: req.user.shopId
});

សម្រាប់ update/delete:

const product = await Product.findOne({
  _id: req.params.id,
  shopId: req.user.shopId
});

if (!product) {
  return res.status(404).json({ message: "Product not found" });
}

ច្បាប់ត្រឹមត្រូវ៖

Admin មើលតែ shop ខ្លួន
Cashier មើលតែ shop ខ្លួន
ADMIN_MANAGER ទើបអាចមើល all shops
6. Token problem

Hacker អាចលួច token បើ project store token មិនល្អ។

គ្រោះថ្នាក់៖

Token in localStorage
XSS អាចលួច token
Token មិន expire
Token មិន verify role
JWT_SECRET ខ្សោយ

ការពារ៖

JWT secret ត្រូវខ្លាំង
Access token ត្រូវ expire ខ្លី
Backend verify token រាល់ request
Do not expose .env
Use HTTPS on production

Auth guard:

import jwt from "jsonwebtoken";

const authGuard = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
7. File upload attack

បើ project upload product image, hacker អាច upload file គ្រោះថ្នាក់។

គ្រោះថ្នាក់៖

Upload .js
Upload .php
Upload .exe
Upload file ធំពេក
Upload fake image
Use original filename dangerous

ការពារ៖

Allow only image/jpeg, image/png, image/webp
Limit file size
Rename file
Store outside sensitive folder
Never execute uploaded file

Multer example:

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});
8. Directory traversal

នេះជារឿងក្នុង TikTok video។

អត្ថន័យ៖
Hacker សាកអាន file នៅក្រៅ folder ដែល website អនុញ្ញាត។

គោលដៅដែល hacker ចង់បាន៖

.env
database config
server config
system file
backup file

ការពារ៖

កុំឲ្យ user បញ្ជូន path ផ្ទាល់ទៅ server
កុំ read file តាម filename ពី user ដោយគ្មាន validate
Use safe upload folder
Normalize path
Block ../

Defensive check:

import path from "path";

const safeBase = path.resolve("uploads");

const getSafeFilePath = (filename) => {
  const filePath = path.resolve(safeBase, filename);

  if (!filePath.startsWith(safeBase)) {
    throw new Error("Invalid file path");
  }

  return filePath;
};
9. NoSQL injection

Project អ្នកប្រើ MongoDB/Mongoose។
បើ backend ទទួល object ពី user ដោយមិន validate អាចមាន NoSQL injection។

គ្រោះថ្នាក់៖

Login bypass
Filter bypass
Query manipulate

ការពារ៖

Validate input type
Email must be string
Password must be string
Do not pass req.body directly into Mongo query
Use express-mongo-sanitize

Install:

npm i express-mongo-sanitize

Use:

import mongoSanitize from "express-mongo-sanitize";

app.use(mongoSanitize());

Login ត្រូវ validate:

if (typeof email !== "string" || typeof password !== "string") {
  return res.status(400).json({ message: "Invalid input" });
}
10. XSS

XSS គឺ hacker បញ្ចូល script ក្នុង input ដូចជា product name, customer name, note, receipt message។

គ្រោះថ្នាក់៖

លួច token
បង្ហាញ fake UI
ប្តូរ content
Attack admin browser

ការពារ React:

កុំប្រើ dangerouslySetInnerHTML
Escape output by default
Validate input
Sanitize rich text បើមាន

កុំធ្វើបែបនេះ៖

<div dangerouslySetInnerHTML={{ __html: product.description }} />

ធ្វើធម្មតា៖

<div>{product.description}</div>
11. CORS misconfiguration

កុំដាក់ production backend ឲ្យ accept all origins។

មិនល្អ៖

app.use(cors({ origin: "*" }));

ល្អជាង៖

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://yourdomain.com"
  ],
  credentials: true
}));
12. Rate limit / brute force login

Hacker អាចសាក password ច្រើនដង។

ការពារ៖

npm i express-rate-limit
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts"
});

router.post("/signin", loginLimiter, authController.signin);
13. Security headers

Install:

npm i helmet

Use:

import helmet from "helmet";

app.use(helmet());

វាជួយការពារ header សុវត្ថិភាពមូលដ្ឋាន។

14. .env leak

.env មិនត្រូវ push ទៅ GitHub។

ត្រូវមាន .gitignore:

.env
node_modules
logs
uploads
dist

បើធ្លាប់ push .env រួច ត្រូវ remove ពី git tracking:

git rm --cached .env
git commit -m "Remove env from git tracking"
git push

ហើយត្រូវប្តូរ secret/token/database password ចាស់ចោល។

15. Test plan សម្រាប់ POS របស់អ្នក
Auth test
[ ] API without token → 401
[ ] Invalid token → 401
[ ] Expired token → 401
[ ] Wrong role → 403
[ ] Correct role → success
Role test
[ ] Cashier cannot create admin
[ ] Cashier cannot delete product
[ ] Cashier cannot edit price
[ ] Cashier cannot view full report
[ ] Cashier cannot access other shop
[ ] Admin cannot access admin-manager system APIs
Sale test
[ ] Backend calculates price from DB
[ ] Backend rejects qty <= 0
[ ] Backend rejects qty over stock
[ ] Backend cuts stock after sale
[ ] Backend saves sale items correctly
[ ] Backend prevents editing paid sale without permission
Product test
[ ] SKU/barcode unique per shop
[ ] Product price must be positive
[ ] Stock cannot be negative
[ ] Only admin can edit product
[ ] Cashier can search/scan only
Upload test
[ ] Accept only image
[ ] Reject non-image
[ ] Limit file size
[ ] Rename uploaded file
[ ] No direct file path from user
Report test
[ ] Cashier sees only allowed daily sale
[ ] Admin sees only own shop report
[ ] ADMIN_MANAGER sees all shops
[ ] Report API requires token
16. Security middleware order in Express

ដាក់ក្នុង app.js ប្រហែលបែបនេះ៖

app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", authGuard, productRoutes);
app.use("/api/v1/sales", authGuard, saleRoutes);
app.use("/api/v1/reports", authGuard, reportRoutes);

app.use(errorMiddleware);
ចំណុចដែលត្រូវចាប់ផ្តើម fix មុនគេ
1. Backend role guard
2. Backend shop ownership check
3. Backend calculate price from DB
4. Backend stock validation
5. File upload validation
6. Remove .env from git
7. Rate limit login
8. Helmet + CORS
9. Mongo sanitize
10. API 401/403 standard

សរុប៖

Hacker មិនវាយពី UI ទេ
Hacker វាយពី API request
ដូច្នេះ Backend ត្រូវជា security center
Frontend គ្រាន់តែ UI
Backend ត្រូវ check token, role, shop, input, price, stock រាល់ request