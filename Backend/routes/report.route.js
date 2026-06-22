const express = require("express")
const { generalReport, saleReport, stockReport, salereportIn30Days } = require("../controller/report.controller")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")

const router = express.Router()

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)

router.get("/general",generalReport)
router.get("/sale",saleReport)
router.get("/stock",stockReport)
router.get("/30daysAgo", salereportIn30Days)

module.exports = router
