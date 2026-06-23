const CustomerModel = require('../models/Customer.model');

exports.createCustomer = async (req, res, next) => {
    try {
        const exist = await CustomerModel.findOne({ phone: req.body.phone });
        if (exist) {
            return res.status(400).json({
                success: false,
                error: 'Customer phone already exists'
            });
        }
        const newDoc = await CustomerModel.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            result: newDoc
        });
    } catch (error) {
        next(error);
    }
};

exports.findAllCustomer = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let querySearch = {};

        if (req.query.search) { 
            const searchRegex = { $regex: req.query.search, $options: "i" };
            querySearch.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { address: searchRegex },
                { note: searchRegex }
            ];
        }

        const docs = await CustomerModel.find(querySearch).skip(skip).limit(limit).sort({ _id: -1 });
        const total = await CustomerModel.countDocuments(querySearch);

        res.status(200).json({
            success: true,
            message: 'Customers retrieved successfully',
            result: docs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }); 
    } catch (error) {
        next(error);
    }
};

exports.findOneCustomer = async (req, res, next) => {
    try {
        const customer = await CustomerModel.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, result: customer });
    } catch (error) {
        next(error);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const customer = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer updated', result: customer });
    } catch (error) {
        next(error);
    }
};

exports.removeCustomer = async (req, res, next) => {
    try {
        const customer = await CustomerModel.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer removed' });
    } catch (error) {
        next(error);
    }
};
