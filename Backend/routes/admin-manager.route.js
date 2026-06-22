const express = require("express")
const restrict = require("../guards/restrict.guard")
const controller = require("../controller/admin-manager.controller")

const router = express.Router()

router.use(restrict("ADMIN_MANAGER"))

router.get("/dashboard", controller.dashboard)
router.route("/shops")
    .get(controller.listShops)
    .post(controller.createShop)
router.route("/shops/:id")
    .get(controller.getShop)
    .patch(controller.updateShop)
    .delete(controller.deleteShop)
router.patch("/shops/:id/status", controller.updateShopStatus)
router.route("/admins")
    .get(controller.listAdmins)
    .post(controller.createAdmin)
router.route("/admins/:id")
    .get(controller.getAdmin)
    .patch(controller.updateAdmin)
router.patch("/admins/:id/status", controller.updateAdminStatus)
router.get("/reports", controller.platformReports)
router.get("/audit-logs", controller.auditLogs)

module.exports = router
