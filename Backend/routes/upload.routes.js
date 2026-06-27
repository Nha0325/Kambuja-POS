const express = require('express')
const router = express.Router()
const { uploadFile, removeFile } = require('../controller/upload.controller')
const restrict = require("../guards/restrict.guard")

router.post('/', restrict("ADMIN_MANAGER", "ADMIN"), uploadFile)
router.delete('/:imageUrl', restrict("ADMIN_MANAGER", "ADMIN"), removeFile)

module.exports = router
