const Product = require("../models/Product.model")
const qs = require('qs')
const { generateProductCode } = require("./counter.controller")

exports.create = async (req, res,next) => {
    try {
        const code = await generateProductCode()
        const newDoc = await Product.create({
            ...req.body,
            code,
            currentStock: req.body.currentStock ?? 0,
        })
        res.status(201).json({
            success: true,
            result: newDoc
        })
    } catch (error) {
        next(error)
    }
}

exports.findAll = async (req, res, next) => {
    try {
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;
        const querySearch = {};
        let sortOption = ""

        // advance filtering
        const reservedFields = ['page', 'limit', 'sort', 'search'];
        const queryFilters = { ...req.query }
        reservedFields.forEach((field) => delete queryFilters[field]);

        // Handle advanced filters (e.g., gte, lte, etc.)
        const filterString = JSON
                              .stringify(queryFilters)
                              .replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`)

        const filters = JSON.parse(filterString)
        
        if (req.query.search) {
           querySearch["$or"] = [
            { name: { $regex: req.query.search, $options: "i" } },
            { code: { $regex: req.query.search, $options: "i" } },
           ];
        }

        // sort
        if(req.query.sort){
            sortOption = req.query.sort
        }else{
            sortOption = "-_id"
        }

        const docs = await Product.find({...querySearch, ...filters})
          .skip(skip)
          .limit(limit)
          .sort(sortOption)
          .populate({
            path: "category",
            select: "name"
          })
          .exec();

        const totalItem = await Product.find(querySearch).countDocuments();
        const totalPage = Math.ceil(totalItem / limit);

        res.status(200).json({
            success: true,
            totalPage,
            result:docs,
        })

    } catch (error) {
        next(error);
    }
}

exports.findOne = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await Product.findById(id).populate("category", "name")
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: doc
        })
    } catch (error) {
        next(error)
    }
}

exports.findOneByCode = async (req, res, next) => {
    try {
        const code = req.params.code
        const doc =await Product.findOne({code}).populate("category", "name")
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: doc
        })
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await Product.findByIdAndUpdate(id, req.body)
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: doc
        })
    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc = await Product.findByIdAndDelete(id)
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: "Deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}
