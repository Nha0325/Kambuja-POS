const express = require('express');
const router = express.Router();
const upload = require('../helper/multer-config');
const { 
    createCustomer, 
    findAllCustomer, 
    findOneCustomer, 
    updateCustomer, 
    removeCustomer 
} = require('../controller/customer.controller');

router.route('/')
    .post(upload.single('image'), createCustomer)
    .get(findAllCustomer);

router.route('/:id')
    .get(findOneCustomer)
    .patch(updateCustomer)
    .delete(removeCustomer);

module.exports = router;