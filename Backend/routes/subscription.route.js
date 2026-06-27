const express = require("express")
const controller = require("../controller/subscription.controller")
const restrict = require("../guards/restrict.guard")

const router = express.Router()

router.use(restrict("ADMIN_MANAGER"))

router.get("/summary", controller.getSummary)
router.get("/", controller.getAll)
router.post("/", controller.create)
router.put("/:id", controller.update)
router.delete("/:id", controller.remove)

module.exports = router
