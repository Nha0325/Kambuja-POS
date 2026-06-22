const express = require("express")
const restrict = require("../guards/restrict.guard")
const { getOwnShop, updateOwnShop } = require("../controller/shop.controller")

const router = express.Router()

router.use(restrict("ADMIN"))
router.get("/me", getOwnShop)
router.patch("/me", updateOwnShop)

module.exports = router
