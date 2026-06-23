const Product = require("../models/Product.model")
const qs = require('qs')
const { generateProductCode } = require("./counter.controller")
const Inventory = require("../models/Inventory.model")
const ProductCode = require("../models/ProductCode.model")

const cashierSafeProduct = (product) => {
    const safe = product.toObject ? product.toObject() : { ...product };
    delete safe.costPrice;
    delete safe.purchasePrice;
    delete safe.supplierPrice;
    delete safe.profit;
    delete safe.margin;
    delete safe.supplier;
    delete safe.stockValue;
    return safe;
}

const normalizeProductPayload = (body) => {
    const payload = { ...(body || {}) }
    delete payload._id
    delete payload.shopId
    delete payload.code

    ;["costPrice", "salePrice", "currentStock"].forEach((field) => {
        if (payload[field] !== undefined) {
            payload[field] = Number(payload[field])
        }
    })

    return payload
}

const validateProductNumbers = (payload) => {
    if (payload.salePrice !== undefined && (!Number.isFinite(payload.salePrice) || payload.salePrice <= 0)) {
        return "Sale price must be greater than zero."
    }

    if (payload.costPrice !== undefined && (!Number.isFinite(payload.costPrice) || payload.costPrice < 0)) {
        return "Cost price must be greater than or equal zero."
    }

    if (payload.currentStock !== undefined && (!Number.isFinite(payload.currentStock) || payload.currentStock < 0)) {
        return "Current stock must be greater than or equal zero."
    }

    return null
}

exports.create = async (req, res,next) => {
    try {
        const payload = normalizeProductPayload(req.body)
        const validationError = validateProductNumbers(payload)
        if (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError,
            })
        }

        const code = await generateProductCode()
        const newDoc = await Product.create({
            ...payload,
            code,
            currentStock: payload.currentStock ?? 0,
            shopId: req.shopId,
        })
        await Promise.all([
            Inventory.create({
                shopId: req.shopId,
                product: newDoc._id,
                quantity: newDoc.currentStock,
                reorderLevel: Number(payload.reorderLevel || 5),
            }),
            ProductCode.create({
                shopId: req.shopId,
                product: newDoc._id,
                code: newDoc.code,
                type: "SKU",
            }),
        ])
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
        const querySearch = { ...req.shopFilter };
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

        const docs = await Product.find({...querySearch, ...filters, ...req.shopFilter})
          .skip(skip)
          .limit(limit)
          .sort(sortOption)
          .populate({
            path: "category",
            select: "name"
          })
          .exec();

        const totalItem = await Product.countDocuments({...querySearch, ...filters, ...req.shopFilter});
        const totalPage = Math.ceil(totalItem / limit);

        let resultDocs = docs;
        if (req.user && req.user.role === 'CASHIER') {
            resultDocs = docs.map(cashierSafeProduct);
        }

        res.status(200).json({
            success: true,
            totalPage,
            result: resultDocs,
        })

    } catch (error) {
        next(error);
    }
}

exports.findOne = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await Product.findOne({ _id: id, ...req.shopFilter }).populate("category", "name")
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        
        const resultDoc = (req.user && req.user.role === 'CASHIER') ? cashierSafeProduct(doc) : doc;
        
        res.status(200).json({
            success: true,
            result: resultDoc
        })
    } catch (error) {
        next(error)
    }
}

exports.findOneByCode = async (req, res, next) => {
    try {
        const code = req.params.code
        const doc =await Product.findOne({code, ...req.shopFilter}).populate("category", "name")
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        
        const resultDoc = (req.user && req.user.role === 'CASHIER') ? cashierSafeProduct(doc) : doc;

        res.status(200).json({
            success: true,
            result: resultDoc
        })
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        const payload = normalizeProductPayload(req.body)
        const validationError = validateProductNumbers(payload)
        if (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError,
            })
        }

        const doc =await Product.findOneAndUpdate(
            { _id: id, ...req.shopFilter },
            payload,
            { new: true, runValidators: true }
        )
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
        const doc = await Product.findOneAndDelete({ _id: id, ...req.shopFilter })
        if(!doc){
            return res.status(404).json({
                success: false,
                error: "Document not found with that ID!"
            })
        }
        await Promise.all([
            Inventory.deleteMany({ shopId: req.shopId, product: id }),
            ProductCode.deleteMany({ shopId: req.shopId, product: id }),
        ])
        res.status(200).json({
            success: true,
            result: "Deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}
