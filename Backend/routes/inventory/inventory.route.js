const express = require("express")
const restrict = require('../../guards/restrict.guard')
const shopScopeGuard = require('../../guards/shop-scope.guard')
const controller = require('../../controller/inventory/inventory.controller')

const router = express.Router()

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)
router.get("/", controller.list)
router.get("/overview", controller.overview)
router.get("/movements", controller.movements)
router.get("/low-stock", controller.lowStock)
router.get("/low-stock-50", controller.lowStock50)
router.post("/receive", restrict("ADMIN"), controller.stockIn)
router.post("/stock-in", restrict("ADMIN"), controller.stockIn)
router.post("/adjust", restrict("ADMIN"), controller.adjust)
router.post("/adjustment", restrict("ADMIN"), controller.adjustment)

module.exports = router
