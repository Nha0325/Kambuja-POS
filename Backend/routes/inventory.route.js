const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const controller = require("../controller/inventory.controller")

const router = express.Router()

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)
router.get("/", controller.list)
router.get("/low-stock", controller.lowStock)
router.post("/stock-in", controller.stockIn)
router.post("/adjust", controller.adjust)

module.exports = router
