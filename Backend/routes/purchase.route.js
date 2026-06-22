const express = require("express")
const restrict = require("../guards/restrict.guard")
const { create, findAll, findOne, updatePurchaseStatus, addPayment } = require("../controller/purchase.controller")
const shopScopeGuard = require("../guards/shop-scope.guard")

const router = express.Router()

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)

router
    .route("/")
    .post(create)
    .get(findAll)

router.patch("/updatePurchaseStatus/:id", updatePurchaseStatus)
router.patch("/addPayment/:id", addPayment)

router
    .route("/:id")
    .get(findOne)
    .patch(updatePurchaseStatus)
module.exports = router
