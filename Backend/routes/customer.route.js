const express = require('express');

const router = express.Router();
const {
    createCustomer,
    findAllCustomers,
    findOneCustomer,
    updateCustomer,
    removeCustomer
} = require('../controller/customer.controller');
const restrict = require("../guards/restrict.guard")
const shopScopeGuard = require("../guards/shop-scope.guard")

router.use(shopScopeGuard)

router
    .route('/')
    .post(restrict("ADMIN"), createCustomer)
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findAllCustomers);

router
    .route('/:id')
    .get(restrict("ADMIN_MANAGER", "ADMIN"), findOneCustomer)
    .patch(restrict("ADMIN"), updateCustomer)
    .delete(restrict("ADMIN"), removeCustomer);

module.exports = router;
