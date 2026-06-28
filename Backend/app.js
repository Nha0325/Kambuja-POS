require("./config/env")
const express = require("express")
const errorHandler = require('./helper/error-handler');

const qs = require("qs")
const cookieParser = require("cookie-parser")
const categoryRouter = require('./routes/inventory/category.routes');
const supplierRouter = require("./routes/purchase/supplier.routes")
const customerRouter = require("./routes/users/customer.route")
const uploadRouter   = require("./routes/upload/upload.routes")
const productRouter  = require("./routes/inventory/product.route")
const authRouter = require("./routes/auth/auth.route")
const userRouter = require("./routes/users/user.route")
const saleRouter = require("./routes/sales/sale.route")
const purchaseRouter = require("./routes/purchase/purchase.route")
const reportRouter = require("./routes/reports/report.route")
const adminManagerRouter = require("./routes/users/admin-manager.route")
const locationRouter = require("./routes/system/location.route")
const shopRouter = require("./routes/system/shop.route")
const productCodeRouter = require("./routes/inventory/product-code.route")
const inventoryRouter = require("./routes/inventory/inventory.route")
const stockMovementRouter = require("./routes/inventory/stock-movement.route")
const paymentRouter = require("./routes/payment/payment.route")
const receiptRouter = require("./routes/sales/receipt.route")
const notificationRouter = require("./routes/engagement/notification.route")
const subscriptionRouter = require("./routes/engagement/subscription.route")
const posRouter = require("./routes/sales/pos.route")
const alertRouter = require("./routes/system/alert.route")
const systemLogRoutes = require("./routes/system/systemLog.routes")
const authGuard = require("./guards/auth.guard")
const morgan = require("morgan")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cors = require('cors')
const mongoSanitize = require("./helper/mongo-sanitize")

const app = express()

const allowedOrigins = [
    ...(process.env.CORS_ALLOWED_ORIGINS || "").split(","),
    process.env.LOCAL_DOMAIN,
    process.env.CLIENT_DOMAIN,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    ...(process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(",") : [])
]
    .map((origin) => origin?.trim())
    .filter(Boolean)

app.use(helmet({crossOriginResourcePolicy: false}))

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders:['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders:['Set-Cookie', 'Authorization']
}))

app.set('query parser',(queryString) => {
    return qs.parse(queryString,{
        decoder: (value) => {
            const num = Number(value);
            return isNaN(num) ? value : num;
        }
    })

})

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 1000,
    message:{
        success: false,
        error:'Too many requests from this IP, please try again!'
    } })
app.use(limiter)
app.use(morgan( process.env.NODE_ENV === "production" ? 'combined' : 'dev'))
app.use(express.json({ limit: "1mb" }))
app.use(mongoSanitize)
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running. Use /api/v1/auth/signin or other API endpoints.'
    })
})

app.use("/api/v1/categories",authGuard,categoryRouter)
app.use("/api/v1/suppliers",authGuard,supplierRouter)
app.use("/api/v1/customers",authGuard,customerRouter)
app.use("/api/v1/upload"   ,authGuard,uploadRouter)
app.use("/api/v1/products",authGuard,productRouter)
app.use("/api/v1/purchases",authGuard, purchaseRouter)
app.use("/api/v1/users",authGuard, userRouter)
app.use("/api/v1/sales",authGuard,saleRouter)
app.use("/api/v1/report",authGuard,reportRouter)
app.use("/api/v1/admin-manager", authGuard, adminManagerRouter)
app.use("/api/admin-manager", authGuard, adminManagerRouter)
app.use("/api/v1/locations", authGuard, locationRouter)
app.use("/api/v1/shops", authGuard, shopRouter)
app.use("/api/v1/product-codes", authGuard, productCodeRouter)
app.use("/api/v1/inventory", authGuard, inventoryRouter)
app.use("/api/v1/stock", authGuard, inventoryRouter)
app.use("/api/v1/stock-movements", authGuard, stockMovementRouter)
app.use("/api/v1/payments", authGuard, paymentRouter)
app.use("/api/v1/receipts", authGuard, receiptRouter)
app.use("/api/v1/notifications", authGuard, notificationRouter)
app.use("/api/v1/subscriptions", authGuard, subscriptionRouter)
app.use("/api/v1/alerts", authGuard, alertRouter)
const heldBillRouter = require("./routes/sales/heldBill.routes")
const dailyCloseRouter = require("./routes/sales/dailyClose.routes")

app.use("/api/v1/held-bills", authGuard, heldBillRouter)
app.use("/api/v1/daily-close", authGuard, dailyCloseRouter)
app.use("/api/v1/pos", authGuard, posRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/system-logs", systemLogRoutes)
const path = require("path")
app.use("/upload", express.static(path.join(__dirname, "upload")))
app.use("/uploads", express.static(path.join(__dirname, "upload")))
app.use(errorHandler)

module.exports = app
