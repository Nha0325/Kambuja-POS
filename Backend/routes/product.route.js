const express = require("express")
const { create, findAll, findOne, findOneByCode, update, remove } = require("../controller/product.controller")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")

const router = express.Router()

router.use(shopScopeGuard)

router
    .route("/")
    .post(restrict("ADMIN"),create)
    .get(restrict("ADMIN_MANAGER","ADMIN","CASHIER"),findAll)
router
    .get("/code/:code",restrict("ADMIN_MANAGER","ADMIN","CASHIER"), findOneByCode)
router
    .route("/:id")
    .get(restrict("ADMIN_MANAGER","ADMIN","CASHIER"),findOne)
    .patch(restrict("ADMIN"),update)
    .delete(restrict("ADMIN"),remove)
module.exports = router
