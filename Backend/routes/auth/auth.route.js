const express = require("express")
const { signup, signin, signout, me } = require('../../controller/auth/auth.controller')
const authGuard = require('../../guards/auth.guard')
const restrict = require('../../guards/restrict.guard')
const rateLimit = require("express-rate-limit")

const router = express.Router()
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many login attempts, please try again later.",
    },
})

router.post("/signup",authGuard,restrict("ADMIN"),signup)
router.post("/signin", loginLimiter, signin)
router.post("/login", loginLimiter, signin)
router.get("/signout",authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), signout)
router.post("/logout",authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), signout)
router.get("/me", authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), me)
router.get("/current", authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), me)

module.exports = router
