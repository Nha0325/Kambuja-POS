const express = require('express')
const router = express.Router()
const { uploadFile, removeFile } = require('../controller/upload.controller')

router.post('/', uploadFile)
router.delete('/:imageUrl', removeFile)

module.exports = router
