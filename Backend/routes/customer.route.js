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

router.use(restrict("ADMIN_MANAGER", "ADMIN"), shopScopeGuard)

router
    .route('/')
    .post(createCustomer)
    .get(findAllCustomers);

router
    .route('/:id')
    .get(findOneCustomer)
    .patch(updateCustomer)
    .delete(removeCustomer);

module.exports = router;
