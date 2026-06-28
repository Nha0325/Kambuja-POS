const ProductCode = require('../../models/inventory/ProductCode.model')
const Product = require('../../models/inventory/Product.model')

exports.list = async (req, res, next) => {
    try {
        const docs = await ProductCode.find(req.shopFilter)
            .populate("product", "name code salePrice")
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.create = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.body.product,
            ...req.shopFilter,
        })
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" })
        }

        const code = await ProductCode.create({
            shopId: req.shopId,
            product: product._id,
            code: req.body.code,
            type: String(req.body.type || "BARCODE").toUpperCase(),
        })
        res.status(201).json({ success: true, result: code })
    } catch (error) {
        next(error)
    }
}

exports.lookup = async (req, res, next) => {
    try {
        const code = await ProductCode.findOne({
            code: req.params.code,
            ...req.shopFilter,
            }).populate("product", "name code imageUrl salePrice costPrice stock currentStock stockQtyBase pricing")

        if (!code) {
            return res.status(404).json({ success: false, error: "Product code not found" })
        }
        return res.status(200).json({ success: true, result: code })
    } catch (error) {
        next(error)
    }
}

exports.listByProduct = async (req, res, next) => {
    try {
        const docs = await ProductCode.find({
            product: req.params.productId,
            ...req.shopFilter,
        }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const doc = await ProductCode.findOneAndDelete({
            _id: req.params.id,
            ...req.shopFilter,
        })
        if (!doc) {
            return res.status(404).json({ success: false, error: "Product code not found" })
        }
        return res.status(200).json({ success: true, result: doc })
    } catch (error) {
        next(error)
    }
}
