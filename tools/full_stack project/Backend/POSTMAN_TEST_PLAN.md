# Backend Postman Test Plan

## 1. Start the backend

1. Open terminal in `d:\project MasteriT\Backend`
2. Install dependencies if not installed:
   ```powershell
   npm install
   ```
3. Start the server:
   ```powershell
   npm start
   ```
4. Default port is `5000` unless `PORT` is set in `.env`.

> Base URL for requests:
> `http://localhost:5000/api/v1`

## 2. Postman environment variables

Use these environment variables in Postman:
- `baseUrl` = `http://localhost:5000/api/v1`
- `token` = `<JWT Token>`

For protected requests, use the `Cookie` header:
- `Cookie: token={{token}}`

## 3. Authentication flow

### 3.1 Sign in
- Method: `POST`
- URL: `{{baseUrl}}/auth/signin`
- Body (JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "yourpassword"
  }
  ```
- Expected response: `success: true` and `result.token`
- Save the returned token to `token` environment variable.

### 3.2 Me
- Method: `GET`
- URL: `{{baseUrl}}/auth/me`
- Headers:
  - `Cookie: token={{token}}`
- Expected: current user data.

### 3.3 Sign out
- Method: `GET`
- URL: `{{baseUrl}}/auth/signout`
- Headers:
  - `Cookie: token={{token}}`

### 3.4 Signup (admin only)
- Method: `POST`
- URL: `{{baseUrl}}/auth/signup`
- Headers:
  - `Cookie: token={{token}}`
- Body sample:
  ```json
  {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "secret123",
    "role": "cashier"
  }
  ```

## 4. User endpoints

### List users
- GET `{{baseUrl}}/users/`
- Auth header: `Cookie: token={{token}}`

### Get user by id
- GET `{{baseUrl}}/users/:id`

### Update user
- PATCH `{{baseUrl}}/users/:id`
- Body sample:
  ```json
  {
    "role": "cashier"
  }
  ```

### Delete user
- DELETE `{{baseUrl}}/users/:id`

> Note: only `admin` (or `super`) can access these.

## 5. Category endpoints

### Create category
- POST `{{baseUrl}}/categories/`
- Body sample:
  ```json
  {
    "name": "Office Supplies",
    "noe": "stationery"
  }
  ```

### List categories
- GET `{{baseUrl}}/categories/?page=1&limit=10&search=Office`

### Get category
- GET `{{baseUrl}}/categories/:id`

### Update category
- PATCH `{{baseUrl}}/categories/:id`
- Body sample:
  ```json
  {
    "name": "Office Supplies Updated"
  }
  ```

### Delete category
- DELETE `{{baseUrl}}/categories/:id`

## 6. Customer endpoints

### Create customer
- POST `{{baseUrl}}/customers/`
- Body sample:
  ```json
  {
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "note": "Regular buyer"
  }
  ```

### List customers
- GET `{{baseUrl}}/customers/?page=1&limit=10&search=John`

### Get customer
- GET `{{baseUrl}}/customers/:id`

### Update customer
- PATCH `{{baseUrl}}/customers/:id`

### Delete customer
- DELETE `{{baseUrl}}/customers/:id`

## 7. Supplier endpoints

### Create supplier
- POST `{{baseUrl}}/suppliers/`
- Body sample:
  ```json
  {
    "name": "Acme Supplies",
    "contactPerson": "Jane Smith",
    "phone": "0987654321",
    "email": "supplier@example.com",
    "address": "456 Market St",
    "note": "Preferred supplier"
  }
  ```

### List suppliers
- GET `{{baseUrl}}/suppliers/?page=1&limit=10&search=Acme`

### Get supplier
- GET `{{baseUrl}}/suppliers/:id`

### Update supplier
- PATCH `{{baseUrl}}/suppliers/:id`

### Delete supplier
- DELETE `{{baseUrl}}/suppliers/:id`

## 8. Product endpoints

### Create product
- POST `{{baseUrl}}/products/`
- Body sample:
  ```json
  {
    "name": "Notebook",
    "category": "<categoryId>",
    "salePrice": 15.5,
    "costPrice": 10.0,
    "description": "A4 notebook",
    "imageUrl": "http://example.com/notebook.jpg"
  }
  ```

### List products
- GET `{{baseUrl}}/products/?page=1&limit=10&search=note&sort=-createdAt`

### Get product by id
- GET `{{baseUrl}}/products/:id`

### Update product
- PATCH `{{baseUrl}}/products/:id`

### Delete product
- DELETE `{{baseUrl}}/products/:id`

### Get product by code
- GET `{{baseUrl}}/products/code/:code`

> Note: product endpoints require `admin` role.

## 9. Purchase endpoints

### Create purchase
- POST `{{baseUrl}}/purchases/`
- Body sample:
  ```json
  {
    "supplier": "<supplierId>",
    "purchaseStatus": "received",
    "totalCost": 1000,
    "items": [
      {
        "product": "<productId>",
        "quantity": 10,
        "unitPrice": 100,
        "totalPrice": 1000
      }
    ]
  }
  ```

### List purchases
- GET `{{baseUrl}}/purchase/?page=1&limit=10&search=INV`

### Get purchase
- GET `{{baseUrl}}/purchase/:id`

### Update purchase status
- PATCH `{{baseUrl}}/purchase/updatePurchaseStatus/:id`
- Body sample:
  ```json
  {
    "purchaseStatus": "received"
  }
  ```

### Add purchase payment
- PATCH `{{baseUrl}}/purchase/addPayment/:id`
- Body sample:
  ```json
  {
    "paidAmount": 500
  }
  ```

## 10. Sale endpoints

### Create sale
- POST `{{baseUrl}}/sale/`
- Body sample:
  ```json
  {
    "customer": "<customerId>",
    "totalCost": 200,
    "paidAmount": 200,
    "items": [
      {
        "product": "<productId>",
        "quantity": 2,
        "unitPrice": 100,
        "totalPrice": 200
      }
    ]
  }
  ```

### List sales
- GET `{{baseUrl}}/sale/?page=1&limit=10&search=INV`

### Get sale
- GET `{{baseUrl}}/sale/find/:id`

### Check stock
- GET `{{baseUrl}}/sale/checkStock?stock=2&product=<productId>`

### Add sale payment
- PATCH `{{baseUrl}}/sale/addPayment/:id`
- Body sample:
  ```json
  {
    "paidAmount": 50
  }
  ```

> Note: sales endpoints require `admin` for create and `admin|cashier` for read/payment.

## 11. Report endpoints

### General report
- GET `{{baseUrl}}/report/general`

### Sale report
- GET `{{baseUrl}}/report/sale?startDate=2026-05-01&endDate=2026-05-19`

### Stock report
- GET `{{baseUrl}}/report/stock?stockQty=10`

### 30 days sales
- GET `{{baseUrl}}/report/30daysAgo`

## 12. Important notes / current backend issues

These problems will block some tests unless fixed first:

- `Backend/app.js` imports `./routes/category.route` but the actual file is `routes/category.routes.js`.
- `Backend/models/Product.model.js` and `Backend/models/product.model.js` are empty, so product-related endpoints will fail.
- `Backend/controller/supplier.controller.js` uses `SupplierModel` but does not define it correctly.
- `Backend/routes/upload.routes.js` is empty, so upload endpoints do not exist.

## 13. Recommended Postman setup

1. Create a request for `POST {{baseUrl}}/auth/signin`.
2. After signin, copy the returned token and set `token` env variable.
3. For every protected request, add header:
   - `Cookie: token={{token}}`
4. Test endpoints in this order:
   1. auth/signin
   2. auth/me
   3. categories/customers/suppliers
   4. products
   5. purchase/sale
   6. reports

---

If you want, I can also generate a Postman collection JSON file in `Backend/` that you can import directly. 