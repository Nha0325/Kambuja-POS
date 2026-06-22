const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const controller = require("../controller/product-code.controller")

const router = express.Router()

router.use(restrict("ADMIN", "CASHIER"), shopScopeGuard)
router.get("/", controller.list)
router.get("/lookup/:code", controller.lookup)
router.get("/product/:productId", controller.listByProduct)
router.post("/", restrict("ADMIN"), controller.create)
router.delete("/:id", restrict("ADMIN"), controller.remove)

module.exports = router
