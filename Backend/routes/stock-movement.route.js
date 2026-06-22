const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const { list } = require("../controller/stock-movement.controller")

const router = express.Router()
router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)
router.get("/", list)

module.exports = router
