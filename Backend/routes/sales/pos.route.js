const express = require("express")
const restrict = require('../../guards/restrict.guard')
const shopScopeGuard = require('../../guards/shop-scope.guard')
const { lookup } = require('../../controller/inventory/product-code.controller')

const router = express.Router()
router.use(restrict("ADMIN_MANAGER", "ADMIN", "CASHIER"), shopScopeGuard)
router.get("/scan/:code", lookup)

module.exports = router
