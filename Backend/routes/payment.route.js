const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const controller = require("../controller/payment.controller")

const router = express.Router()
router.use(restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), shopScopeGuard)
router.post("/", controller.create)
router.get("/sale/:saleId", controller.listBySale)

module.exports = router
