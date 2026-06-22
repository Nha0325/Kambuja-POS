const express = require('express');

const router = express.Router();
const {
    createSupplier,
    findAllSuppliers,
    findOneSupplier,
    updateSupplier,
    removeSupplier
} = require('../controller/supplier.controller');
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)

router
    .route('/')
    .post(createSupplier)
    .get(findAllSuppliers);

router
    .route('/:id')
    .get(findOneSupplier)
    .patch(updateSupplier)
    .delete(removeSupplier);

module.exports = router;
