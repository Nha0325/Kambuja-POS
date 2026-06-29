const express = require("express")
const restrict = require('../../guards/restrict.guard')
const shopScopeGuard = require('../../guards/shop-scope.guard')
const { create, findAll, findToday, findOne, checkStock } = require('../../controller/sales/sale.controller')

const router = express.Router()

router.use(shopScopeGuard)

router
    .route("/")
    .post(restrict("ADMIN", "CASHIER"), create)
    .get(restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), findAll)

router.get("/checkStock", restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), checkStock)
router.get("/today", restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), findToday)

router // Moved to bottom so it doesn't shadow other routes
    .route("/:id")
    .get(restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), findOne)
module.exports = router
