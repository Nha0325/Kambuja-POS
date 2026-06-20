const express = require('express');

const router = express.Router();
const { createCategory, findAllCategory, findOneCategory, UpdateCategory, RemoveCategory } = require('../controller/category.controller');

router
    .route('/')
    .post(createCategory)
    .get(findAllCategory);

router
    .route('/:id')
    .get(findOneCategory)
    .patch(UpdateCategory)
    .delete(RemoveCategory);

module.exports = router;