# MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | ADMIN_MANAGER, ADMIN, and CASHIER accounts |
| `shops` | business and location records |
| `categories` | shop product categories |
| `products` | shop products and prices |
| `product_codes` | barcode, QR, and SKU mappings |
| `inventory` | current quantity and reorder level |
| `stock_movements` | inventory adjustment history |
| `sales` | POS sales and line items |
| `payments` | sale payments |
| `receipts` | issued receipts |
| `customers` | customer records without login access |
| `telegram_settings` | shop Telegram bot configuration |
| `notifications` | shop and platform notifications |
| `settings` | shop or platform settings |
| `audit_logs` | shop audit history |

MongoDB documents use `String` IDs and Spring Data `MongoRepository`. The project does not use JPA or SQL migrations.
