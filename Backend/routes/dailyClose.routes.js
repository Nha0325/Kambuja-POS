const express = require("express");
const router = express.Router();
const dailyCloseController = require("../controller/dailyClose.controller");
const shopScopeGuard = require("../guards/shop-scope.guard");

router.use(shopScopeGuard);

router.get("/current", dailyCloseController.getCurrent);
router.post("/open", dailyCloseController.open);
router.post("/close", dailyCloseController.close);
router.get("/history", dailyCloseController.history);

module.exports = router;
