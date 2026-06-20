const dotenv = require('dotenv')
dotenv.config()
const express = require("express")
const errorHandler = require('./helper/error-handler');
const qs = require("qs")
const cookieParser = require("cookie-parser")
const categoryRouter = require('./routes/category.routes');
const customerRouter = require("./routes/customer.routes")
const supplierRouter = require("./routes/supplier.routes")
const uploadRouter   = require("./routes/upload.routes")
const productRouter  = require("./routes/product.route")
const authRouter = require("./routes/auth.route")
const userRouter = require("./routes/user.route")
const saleRouter = require("./routes/sale.route")
const purchaseRouter = require("./routes/purchase.route")
const reportRouter = require("./routes/report.route")
const authGuard = require("./guards/auth.guard")
const morgan = require("morgan")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cors = require('cors')

const app = express()

const allowedOrigins = [
    process.env.LOCAL_DOMAIN,
    process.env.CLIENT_DOMAIN
]

app.use(cors({
    origin: (origin, callback) => {
        console.log('origin:',origin)
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
app.use(helmet({crossOriginResourcePolicy: false}))
app.use(morgan( process.env.NODE_ENV === "production" ? 'combined' : 'dev'))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running. Use /api/v1/auth/signin or other API endpoints.'
    })
})

app.use("/api/v1/categories",authGuard,categoryRouter)
app.use("/api/v1/customers",authGuard,customerRouter)
app.use("/api/v1/suppliers",authGuard,supplierRouter)
app.use("/api/v1/upload"   ,authGuard,uploadRouter)
app.use("/api/v1/products",authGuard,productRouter)
app.use("/api/v1/purchases",authGuard, purchaseRouter)
app.use("/api/v1/users",authGuard, userRouter)
app.use("/api/v1/sales",authGuard,saleRouter)
app.use("/api/v1/report",authGuard,reportRouter)
app.use("/api/v1/auth",authRouter)
app.use("/upload", express.static('upload'))
app.use(errorHandler)

module.exports = app