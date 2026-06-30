const Product = require('../../models/inventory/Product.model')
const { generateProductCode } = require('../system/counter.controller')
const ProductCode = require('../../models/inventory/ProductCode.model')
const Inventory = require('../../models/inventory/Inventory.model')
const { getLowStockThreshold } = require('../../helper/stock.helper')

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

const normalizeStatus = (value) => {
    if (typeof value === "boolean") return value ? "ACTIVE" : "INACTIVE"
    if (!value) return undefined
    const status = String(value).trim().toUpperCase()
    return ["ACTIVE", "INACTIVE"].includes(status) ? status : undefined
}

const normalizeProductPayload = (body) => {
    const payload = { ...(body || {}) }
    delete payload._id
    delete payload.shopId
    delete payload.code
    delete payload.stock
    delete payload.currentStock
    delete payload.stockQtyBase

    // Accept categoryId alias
    if (payload.categoryId && !payload.category) {
        payload.category = payload.categoryId
    }
    delete payload.categoryId

    // Accept supplierId alias
    if (payload.supplierId && !payload.supplier) {
        payload.supplier = payload.supplierId
    }
    delete payload.supplierId

    // Accept image alias for imageUrl
    if (payload.image && !payload.imageUrl) {
        payload.imageUrl = payload.image
    }
    delete payload.image

    // Normalise low-stock threshold
    const threshold = payload.lowStockThreshold ?? payload.lowStockThresholdBase ?? payload.reorderLevel
    if (threshold !== undefined) {
        payload.lowStockThreshold = Number(threshold)
        payload.reorderLevel = Number(threshold)
    }
    delete payload.lowStockThresholdBase

    // Accept sellPrice alias for salePrice
    if (payload.sellPrice !== undefined && payload.salePrice === undefined) {
        payload.salePrice = payload.sellPrice
    }
    delete payload.sellPrice

    // Remove all unit-conversion fields
    delete payload.unitTemplate
    delete payload.baseUnit
    delete payload.purchaseUnit
    delete payload.unitsPerPurchaseUnit
    delete payload.allowedSaleUnits
    delete payload.saleUnits
    delete payload.unitConfig
    delete payload.costPerPurchaseUnit
    delete payload.costPerBaseUnit
    delete payload.salePricePerBaseUnit
    delete payload.sellPricePerBaseUnit
    delete payload.salePricePerPurchaseUnit
    delete payload.sellPricePerPurchaseUnit
    delete payload.pricing
    delete payload.packagingDisplay

    // Normalise status
    const status = normalizeStatus(payload.status)
    if (status) {
        payload.status = status
    } else {
        delete payload.status
    }

    // Coerce numeric fields
    ;["costPrice", "salePrice", "lowStockThreshold", "reorderLevel"].forEach((field) => {
        if (payload[field] !== undefined) {
            payload[field] = Number(payload[field])
        }
    })

    if (payload.barcode === "") delete payload.barcode
    if (payload.sku === "") delete payload.sku

    return payload
}

const validateProductNumbers = (payload) => {
    if (payload.salePrice !== undefined && (!Number.isFinite(payload.salePrice) || payload.salePrice <= 0)) {
        return "Sale price must be greater than zero."
    }

    if (payload.costPrice !== undefined && (!Number.isFinite(payload.costPrice) || payload.costPrice < 0)) {
        return "Cost price must be greater than or equal zero."
    }

    const threshold = payload.lowStockThreshold ?? payload.lowStockThresholdBase ?? payload.reorderLevel
    if (threshold !== undefined && (!Number.isFinite(Number(threshold)) || Number(threshold) < 0)) {
        return "Low stock threshold must be greater than or equal zero."
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

        // Prevent duplicates in the same shop
        const orConditions = [{ code }]
        if (payload.barcode) orConditions.push({ barcode: payload.barcode })
        if (payload.sku) orConditions.push({ sku: payload.sku })

        const existing = await Product.findOne({
            shopId: req.shopId,
            $or: orConditions
        })

        if (existing) {
            let conflictField = "code"
            if (payload.barcode && existing.barcode === payload.barcode) conflictField = "barcode"
            else if (payload.sku && existing.sku === payload.sku) conflictField = "sku"
            
            return res.status(409).json({
                success: false,
                error: `This code/barcode already exists on another product: "${existing.name}"`
            })
        }

        const newDoc = await Product.create({
            ...payload,
            code,
            shopId: req.shopId,
            stock: 0,
            currentStock: 0,
            lowStockThreshold: getLowStockThreshold(payload),
            reorderLevel: getLowStockThreshold(payload),
        })
        await ProductCode.create({
            shopId: req.shopId,
            product: newDoc._id,
            code: newDoc.code,
            type: "SKU",
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

        if (req.user && req.user.role === 'CASHIER') {
            querySearch.status = "ACTIVE";
        }

        const docs = await Product.find({...querySearch, ...filters, ...req.shopFilter})
          .skip(skip)
          .limit(limit)
          .sort(sortOption)
          .populate({
            path: "category",
            select: "name"
          })
          .populate({
            path: "shopId",
            select: "name"
          })
          .populate({
            path: "supplier",
            select: "name businessName"
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
        const doc =await Product.findOne({ _id: id, ...req.shopFilter })
            .populate("category", "name")
            .populate("shopId", "name")
            .populate("supplier", "name businessName")
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
        const doc =await Product.findOne({code, ...req.shopFilter})
            .populate("category", "name")
            .populate("shopId", "name")
            .populate("supplier", "name businessName")
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

        const updateQuery = { $set: payload }
        if (payload.barcode === undefined && 'barcode' in req.body && req.body.barcode === "") {
            updateQuery.$unset = updateQuery.$unset || {}
            updateQuery.$unset.barcode = 1
        }
        if (payload.sku === undefined && 'sku' in req.body && req.body.sku === "") {
            updateQuery.$unset = updateQuery.$unset || {}
            updateQuery.$unset.sku = 1
        }

        const doc =await Product.findOneAndUpdate(
            { _id: id, ...req.shopFilter },
            updateQuery,
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

exports.scanByCode = async (req, res, next) => {
    try {
        const code = (req.params.code || "").trim()
        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Invalid barcode"
            })
        }

        const doc = await Product.findOne({
            ...req.shopFilter,
            isDeleted: { $ne: true },
            $or: [
                { barcode: code },
                { sku: code },
                { code: code },
            ],
        })
            .populate("category", "name")

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        if (doc.status !== "ACTIVE") {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const currentStock = Number(doc.stock ?? doc.currentStock ?? 0)
        if (currentStock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            })
        }

        res.status(200).json({
            success: true,
            message: "Product found",
            data: {
                _id: doc._id,
                name: doc.name,
                barcode: doc.barcode || "",
                sku: doc.sku || "",
                code: doc.code,
                imageUrl: doc.imageUrl || "",
                category: doc.category?.name || "",
                stock: currentStock,
                salePrice: doc.salePrice,
                costPrice: doc.costPrice,
                status: doc.status,
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.lookupProduct = async (req, res, next) => {
    try {
        const code = req.params.code;
        if (!code) {
            return res.status(400).json({ success: false, error: "Code is required" });
        }
        
        const doc = await Product.findOne({
            ...req.shopFilter,
            $or: [
                { code },
                { barcode: code },
                { sku: code }
            ]
        })
        .populate("category", "name")
        .populate("shopId", "name")
        .populate("supplier", "name businessName");
        
        if (!doc) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        if (doc.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                error: "Product is inactive"
            });
        }
        
        const resultDoc = (req.user && req.user.role === 'CASHIER') ? cashierSafeProduct(doc) : doc;
        
        res.status(200).json({
            success: true,
            result: resultDoc
        });
    } catch (error) {
        next(error);
    }
}
