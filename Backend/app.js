require("./config/env")
const express = require("express")
const errorHandler = require('./helper/error-handler');
const qs = require("qs")
const cookieParser = require("cookie-parser")
const categoryRouter = require('./routes/category.routes');
const supplierRouter = require("./routes/supplier.routes")
const customerRouter = require("./routes/customer.route")
const uploadRouter   = require("./routes/upload.routes")
const productRouter  = require("./routes/product.route")
const authRouter = require("./routes/auth.route")
const userRouter = require("./routes/user.route")
const saleRouter = require("./routes/sale.route")
const purchaseRouter = require("./routes/purchase.route")
const reportRouter = require("./routes/report.route")
const adminManagerRouter = require("./routes/admin-manager.route")
const shopRouter = require("./routes/shop.route")
const productCodeRouter = require("./routes/product-code.route")
const inventoryRouter = require("./routes/inventory.route")
const stockMovementRouter = require("./routes/stock-movement.route")
const paymentRouter = require("./routes/payment.route")
const receiptRouter = require("./routes/receipt.route")
const notificationRouter = require("./routes/notification.route")
const posRouter = require("./routes/pos.route")
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
    "http://localhost:5174"
]
    .map((origin) => origin?.trim())
    .filter(Boolean)

app.use(helmet({crossOriginResourcePolicy: false}))

app.use(cors({
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error("Not allowed by CORS"))
        }
    },
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
app.use("/api/v1/shops", authGuard, shopRouter)
app.use("/api/v1/product-codes", authGuard, productCodeRouter)
app.use("/api/v1/inventory", authGuard, inventoryRouter)
app.use("/api/v1/stock-movements", authGuard, stockMovementRouter)
app.use("/api/v1/payments", authGuard, paymentRouter)
app.use("/api/v1/receipts", authGuard, receiptRouter)
app.use("/api/v1/notifications", authGuard, notificationRouter)
const heldBillRouter = require("./routes/heldBill.routes")
const dailyCloseRouter = require("./routes/dailyClose.routes")

app.use("/api/v1/held-bills", authGuard, heldBillRouter)
app.use("/api/v1/daily-close", authGuard, dailyCloseRouter)
app.use("/api/v1/pos", authGuard, posRouter)
app.use("/api/v1/auth",authRouter)
app.use("/upload", express.static('upload'))
app.use(errorHandler)

module.exports = app
