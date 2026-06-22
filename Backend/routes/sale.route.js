const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const { create, findAll, findToday, findOne, checkStock, addPayment } = require("../controller/sale.controller")

const router = express.Router()

router.use(shopScopeGuard)

router
    .route("/")
    .post(restrict("CASHIER"), create)
    .get(restrict("ADMIN", "CASHIER"), findAll)

router.get("/checkStock", restrict("ADMIN", "CASHIER"), checkStock)
router.get("/today", restrict("ADMIN", "CASHIER"), findToday)
router.patch("/addPayment/:id", restrict("ADMIN", "CASHIER"), addPayment)

router // Moved to bottom so it doesn't shadow other routes
    .route("/:id")
    .get(restrict("ADMIN", "CASHIER"), findOne)
module.exports = router
