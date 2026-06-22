const express = require("express")
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")
const controller = require("../controller/notification.controller")

const router = express.Router()
router.use(restrict("ADMIN"), shopScopeGuard)
router.get("/channels", controller.listChannels)
router.post("/channels", controller.saveChannel)
router.delete("/channels/:id", controller.removeChannel)
router.get("/logs", controller.listLogs)

module.exports = router
