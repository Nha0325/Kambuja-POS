const CategoryModel = require('../../models/inventory/Category.model');
const ProductModel = require('../../models/inventory/Product.model');

exports.createCategory = async (req, res, next) => {
    try {
       const exist = await CategoryModel.findOne({
        ...req.shopFilter,
        name: req.body.name,
       })
       if(exist){
        return res.status(400).json({
            success: false,
            error: 'Category already exists'
        });
       }
       const newDoc=await CategoryModel.create({
        ...req.body,
        shopId: req.shopId,
       })
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
        let querySearch = { ...req.shopFilter };

        if (req.query.search) { 
            const searchRegex = { $regex: req.query.search, $options: "i" };
            querySearch.$or = [
                { name: searchRegex },
                { note: searchRegex }
            ];
        }
        if (req.query.status && req.query.status !== 'All') {
            querySearch.status = req.query.status;
        }

        const pipeline = [
            { $match: querySearch },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "products"
                }
            },
            {
                $addFields: {
                    productsCount: { $size: "$products" }
                }
            },
            {
                $project: {
                    products: 0
                }
            }
        ];

        const docs = await CategoryModel.aggregate(pipeline);
        const total = await CategoryModel.countDocuments(querySearch);
        const totalActive = await CategoryModel.countDocuments({ ...req.shopFilter, status: 'ACTIVE' });
        const totalCategories = await CategoryModel.countDocuments(req.shopFilter);
        const totalProductsLinked = await ProductModel.countDocuments({ 
            ...req.shopFilter, 
            category: { $in: await CategoryModel.find(req.shopFilter).distinct('_id') } 
        });

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            result: docs,
            total,
            totalCategories,
            totalActive,
            totalProductsLinked,
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
        const category = await CategoryModel.findOne({ _id: id, ...req.shopFilter });

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

        const category = await CategoryModel.findOneAndUpdate({ _id: id, ...req.shopFilter }, req.body, {
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
        const category = await CategoryModel.findOneAndDelete({ _id: id, ...req.shopFilter });

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
