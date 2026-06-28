const express = require("express");
const restrict = require('../../guards/restrict.guard');
const shopScopeGuard = require('../../guards/shop-scope.guard');
const controller = require('../../controller/system/alert.controller');

const router = express.Router();

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard);

router.get("/summary", controller.getAlertSummary);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);
router.get("/", controller.getAlerts);
router.delete("/:id", controller.deleteAlert);
router.patch("/:id/resolve", controller.resolveAlert);

module.exports = router;
