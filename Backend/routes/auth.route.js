const express = require("express")
const { signup, signin, signout, me } = require("../controller/auth.controller")
const authGuard = require("../guards/auth.guard")
const restrict = require("../guards/restrict.guard")

const router = express.Router()

router.post("/signup",authGuard,restrict("admin"),signup)
router.post("/signin", signin)
router.get("/signout",authGuard,restrict("super", "admin", "cashier"), signout)
router.get("/me", authGuard,restrict("super", "admin", "cashier"), me)

module.exports = router
