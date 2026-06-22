const SupplierModel = require('../models/Supplier.model');

exports.createSupplier = async (req, res, next) => {
    try {
       const exist = await SupplierModel.findOne({
        ...req.shopFilter,
        phone: req.body.phone,
       })
       if(exist){
        return res.status(400).json({
            success: false,
            error: 'Supplier already exists'
        });
       }
       const newDoc=await SupplierModel.create({
        ...req.body,
        shopId: req.shopId,
       })
        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            result: newDoc
        });
    } catch (error) {
        next(error);
    }
};

exports.findAllSuppliers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let querySearch = { ...req.shopFilter };

        if (req.query.search) { 
            const searchRegex = { $regex: req.query.search, $options: "i" };
            querySearch.$or = [
                { businessName: searchRegex },
                { name: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { address: searchRegex },
                { note: searchRegex }
            ];
        }

        const docs = await SupplierModel.find(querySearch).skip(skip).limit(limit).sort({ _id: -1 });
        const total = await SupplierModel.countDocuments(querySearch);

        res.status(200).json({
            success: true,
            message: 'Suppliers retrieved successfully',
            result: docs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }); 
    } catch (error) {
        next(error);
    }
};

exports.findOneSupplier = async (req, res, next) => {
    try {
        const id=req.params.id;
        const supplier = await SupplierModel.findOne({ _id: id, ...req.shopFilter });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Supplier retrieved successfully',
            result: supplier
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSupplier = async (req, res, next) => {
    try {
        const id=req.params.id;

        const supplier = await SupplierModel.findOneAndUpdate({ _id: id, ...req.shopFilter }, req.body, {
            new: true,
            runValidators: true
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Supplier updated successfully',
            result: supplier
        });
    } catch (error) {
        next(error);
    }
};

exports.removeSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await SupplierModel.findOneAndDelete({ _id: id, ...req.shopFilter });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Supplier removed successfully',
            result: supplier
        });
    } catch (error) {
        next(error);
    }
};
