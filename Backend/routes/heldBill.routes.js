const express = require("express");
const router = express.Router();
const heldBillController = require("../controller/heldBill.controller");
const shopScopeGuard = require("../guards/shop-scope.guard");
const restrict = require("../guards/restrict.guard");

router.use(restrict("ADMIN", "CASHIER"), shopScopeGuard);

router.post("/", heldBillController.create);
router.get("/", heldBillController.findAll);
router.get("/:id", heldBillController.findOne);
router.patch("/:id/cancel", heldBillController.cancel);
router.patch("/:id/complete", heldBillController.complete);

module.exports = router;
