const express = require("express");
const controller = require("../controller/unit.controller");
const restrict = require("../guards/restrict.guard");

const router = express.Router();

router.get("/", controller.list);
router.post("/", restrict("ADMIN"), controller.create);
router.patch("/:id", restrict("ADMIN"), controller.update);
router.delete("/:id", restrict("ADMIN"), controller.delete);

module.exports = router;
