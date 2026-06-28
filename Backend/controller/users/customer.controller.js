const CustomerModel = require('../../models/users/Customer.model');

exports.createCustomer = async (req, res, next) => {
    try {
       const exist = await CustomerModel.findOne({
        ...req.shopFilter,
        phone: req.body.phone,
       })
       if(exist){
        return res.status(400).json({
            success: false,
            error: 'Customer with this phone number already exists'
        });
       }
       const newDoc = await CustomerModel.create({
        ...req.body,
        shopId: req.shopId,
       })
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            result: newDoc
        });
    } catch (error) {
        next(error);
    }
};

exports.findAllCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let querySearch = { ...req.shopFilter };

        if (req.query.search) { 
            const searchRegex = { $regex: req.query.search, $options: "i" };
            querySearch.$or = [
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
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
        const id=req.params.id;
        const customer = await CustomerModel.findOne({ _id: id, ...req.shopFilter });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer retrieved successfully',
            result: customer
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const id=req.params.id;

        const customer = await CustomerModel.findOneAndUpdate({ _id: id, ...req.shopFilter }, req.body, {
            new: true,
            runValidators: true
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            result: customer
        });
    } catch (error) {
        next(error);
    }
};

exports.removeCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await CustomerModel.findOneAndDelete({ _id: id, ...req.shopFilter });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer removed successfully',
            result: customer
        });
    } catch (error) {
        next(error);
    }
};
