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

router.use(shopScopeGuard)

router
    .route('/')
    .post(restrict("ADMIN"), createSupplier)
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findAllSuppliers);

router
    .route('/:id')
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findOneSupplier)
    .patch(restrict("ADMIN"), updateSupplier)
    .delete(restrict("ADMIN"), removeSupplier);

module.exports = router;
