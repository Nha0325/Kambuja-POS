const express = require("express")
const restrict = require("../guards/restrict.guard")
const { create, findAll, findOne, updatePurchaseStatus, addPayment } = require("../controller/purchase.controller")
const shopScopeGuard = require("../guards/shop-scope.guard")

const router = express.Router()

router.use(shopScopeGuard)

router
    .route("/")
    .post(restrict("ADMIN"), create)
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findAll)

router.patch("/updatePurchaseStatus/:id", restrict("ADMIN"), updatePurchaseStatus)
router.patch("/addPayment/:id", restrict("ADMIN"), addPayment)

router
    .route("/:id")
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findOne)
    .patch(restrict("ADMIN"), updatePurchaseStatus)
module.exports = router
