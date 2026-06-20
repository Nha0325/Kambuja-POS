const express = require("express")
const { generalReport, saleReport, stockReport, salereportIn30Days } = require("../controller/report.controller")
const restrict = require("../guards/restrict.guard")

const router = express.Router()

router.get("/general",restrict("super", "admin"),generalReport)
router.get("/sale",restrict("super", "admin"),saleReport)
router.get("/stock",restrict("super", "admin"),stockReport)
router.get("/30daysAgo", restrict("super", "admin"),salereportIn30Days)

module.exports = router
