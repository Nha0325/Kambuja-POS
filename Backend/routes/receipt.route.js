const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const controller = require("../controller/receipt.controller")

const router = express.Router()
router.use(restrict("ADMIN", "CASHIER"), shopScopeGuard)
router.post("/sale/:saleId", controller.issue)
router.get("/sale/:saleId", controller.getBySale)
router.post("/sale/:saleId/print", controller.markPrinted)
router.get("/:saleId", controller.getBySale)
router.post("/:saleId/print", controller.markPrinted)

module.exports = router
