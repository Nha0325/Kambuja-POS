const express = require("express")
const restrict = require("../guards/restrict.guard")
const { findAll, findOne, update, remove } = require("../controller/user.controller")

const router = express.Router()

router.use(restrict("ADMIN"))

router
    .route("/")
    .get(findAll)

router
    .route("/:id")
    .get(findOne)
    .patch(update)
    .delete(remove)


module.exports = router
