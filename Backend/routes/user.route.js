const express = require("express")
const restrict = require("../guards/restrict.guard")
const { findAll, findOne, update, remove } = require("../controller/user.controller")

const router = express.Router()

router
    .route("/")
    .get(restrict("admin"),findAll)

router
    .route("/:id")
    .get(restrict("admin"),findOne)
    .patch(restrict("admin"),update)
    .delete(restrict("admin"),remove)


module.exports = router