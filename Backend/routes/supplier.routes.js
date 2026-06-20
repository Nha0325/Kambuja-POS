const express = require('express');

const router = express.Router();
const {
    createSupplier,
    findAllSuppliers,
    findOneSupplier,
    updateSupplier,
    removeSupplier
} = require('../controller/supplier.controller');

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
