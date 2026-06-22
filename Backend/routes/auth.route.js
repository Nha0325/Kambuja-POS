const express = require("express")
const { signup, signin, signout, me } = require("../controller/auth.controller")
const authGuard = require("../guards/auth.guard")
const restrict = require("../guards/restrict.guard")

const router = express.Router()

router.post("/signup",authGuard,restrict("ADMIN"),signup)
router.post("/signin", signin)
router.post("/login", signin)
router.get("/signout",authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), signout)
router.post("/logout",authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), signout)
router.get("/me", authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), me)
router.get("/current", authGuard,restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), me)

module.exports = router
