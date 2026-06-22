const express = require('express');

const router = express.Router();
const { createCategory, findAllCategory, findOneCategory, UpdateCategory, RemoveCategory } = require('../controller/category.controller');
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")

router.use(shopScopeGuard)

router
    .route('/')
    .post(restrict("ADMIN"), createCategory)
    .get(restrict("ADMIN", "CASHIER"), findAllCategory);

router
    .route('/:id')
    .get(restrict("ADMIN", "CASHIER"), findOneCategory)
    .patch(restrict("ADMIN"), UpdateCategory)
    .delete(restrict("ADMIN"), RemoveCategory);

module.exports = router;
