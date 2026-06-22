const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const { lookup } = require("../controller/product-code.controller")

const router = express.Router()
router.use(restrict("CASHIER"), shopScopeGuard)
router.get("/scan/:code", lookup)

module.exports = router
