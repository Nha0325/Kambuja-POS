const express = require("express")
const restrict = require("../guards/restrict.guard")
const authGuard = require("../guards/auth.guard")
const { create, findAll, findOne, checkStock, addPayment } = require("../controller/sale.controller")

const router = express.Router()

// Apply authGuard to all routes in this router
router.use(authGuard)

router
    .route("/")
    .post(restrict("super", "admin", "cashier"), create)
    .get(restrict("super", "admin", "cashier"), findAll)

router.get("/checkStock", restrict("super", "admin", "cashier"), checkStock)
router.patch("/addPayment/:id", restrict("super", "admin", "cashier"), addPayment)

router // Moved to bottom so it doesn't shadow other routes
    .route("/:id")
    .get(restrict("super", "admin", "cashier"), findOne)
module.exports = router