# MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | ADMIN_MANAGER, ADMIN, and CASHIER accounts |
| `shops` | business locations |
| `categories` | shop-scoped product categories |
| `products` | shop-scoped products and current stock |
| `productcodes` | barcode, QR, and SKU mappings |
| `inventories` | quantity and reorder level |
| `stockmovements` | stock-in, sale, adjustment, and return history |
| `suppliers` | shop suppliers |
| `purchases` | purchase records |
| `sales` | POS sales and line items |
| `payments` | sale payments |
| `receipts` | issued receipts |
| `auditlogs` | platform and shop audit history |
| `notificationchannels` | shop notification destinations |
| `notificationlogs` | notification delivery history |
| `counters` | product and invoice number sequences |

Documents use MongoDB ObjectIds through Mongoose. Customer records are not part of the project.
