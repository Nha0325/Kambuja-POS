const express = require("express");
const router = express.Router();
const dailyCloseController = require('../../controller/sales/dailyClose.controller');
const shopScopeGuard = require('../../guards/shop-scope.guard');
const restrict = require('../../guards/restrict.guard');

router.use(restrict("ADMIN", "CASHIER"), shopScopeGuard);

router.get("/current", dailyCloseController.getCurrent);
router.post("/open", dailyCloseController.open);
router.post("/close", dailyCloseController.close);
router.get("/history", dailyCloseController.history);

module.exports = router;
