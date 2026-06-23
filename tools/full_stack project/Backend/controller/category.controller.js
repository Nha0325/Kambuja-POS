const CategoryModel = require('../models/Category.model');

exports.createCategory = async (req, res, next) => {
    try {
       const exist = await CategoryModel.findOne({ name: req.body.name })
       if(exist){
        return res.status(400).json({
            success: false,
            error: 'Category already exists'
        });
       }
       const newDoc=await CategoryModel.create(req.body)
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            result: newDoc
        });
    } catch (error) {
        next(error);
    }
};

exports.findAllCategory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let querySearch = {};

        if (req.query.search) { 
            const searchRegex = { $regex: req.query.search, $options: "i" };
            querySearch.$or = [
                { name: searchRegex },
                { note: searchRegex }
            ];
        }

        const docs = await CategoryModel.find(querySearch).skip(skip).limit(limit).sort({ _id: -1 });
        const total = await CategoryModel.countDocuments(querySearch);

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            result: docs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }); 
    } catch (error) {
        next(error);
    }
};

exports.findOneCategory = async (req, res, next) => {
    try {
        const id=req.params.id;
        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            result: category
        });
    } catch (error) {
        next(error);
    }
};

exports.UpdateCategory = async (req, res, next) => {
    try {
        const id=req.params.id;

        const category = await CategoryModel.findByIdAndUpdate(id,  req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            result: category
        });
    } catch (error) {
        next(error);
    }
};

exports.RemoveCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Category removed successfully',
            result: category
        });
    } catch (error) {
        next(error);
    }
};
