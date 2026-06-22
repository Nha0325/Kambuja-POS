const Inventory = require("../models/Inventory.model")
const Product = require("../models/Product.model")
const StockMovement = require("../models/StockMovement.model")
const { writeAuditLog } = require("../helper/audit")

const updateStock = async (req, res, next, movementType) => {
    try {
        const productId = req.body.productId || req.body.product
        const quantity = Number(req.body.quantity)
        if (!productId || !Number.isFinite(quantity) || quantity === 0) {
            return res.status(400).json({
                success: false,
                error: "productId and a non-zero quantity are required",
            })
        }

        const product = await Product.findOne({ _id: productId, ...req.shopFilter })
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" })
        }

        const delta = movementType === "STOCK_IN" ? Math.abs(quantity) : quantity
        const quantityBefore = Number(product.currentStock || 0)
        const quantityAfter = quantityBefore + delta
        if (quantityAfter < 0) {
            return res.status(400).json({ success: false, error: "Insufficient stock" })
        }

        product.currentStock = quantityAfter
        await product.save()

        const inventory = await Inventory.findOneAndUpdate(
            { shopId: req.shopId, product: product._id },
            {
                quantity: quantityAfter,
                ...(req.body.reorderLevel !== undefined
                    ? { reorderLevel: Number(req.body.reorderLevel) }
                    : {}),
            },
            { new: true, upsert: true, runValidators: true }
        ).populate("product", "name code imageUrl salePrice")

        await StockMovement.create({
            shopId: req.shopId,
            product: product._id,
            user: req.user._id,
            type: movementType,
            quantity: delta,
            quantityBefore,
            quantityAfter,
            note: req.body.note,
        })
        await writeAuditLog(req, movementType, "Product", product._id, {
            quantity: delta,
            quantityAfter,
        })

        return res.status(200).json({ success: true, result: inventory })
    } catch (error) {
        next(error)
    }
}

exports.list = async (req, res, next) => {
    try {
        const docs = await Inventory.find(req.shopFilter)
            .populate("product", "name code imageUrl costPrice salePrice currentStock")
            .sort({ updatedAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.lowStock = async (req, res, next) => {
    try {
        const docs = await Inventory.find({
            ...req.shopFilter,
            $expr: { $lte: ["$quantity", "$reorderLevel"] },
        }).populate("product", "name code imageUrl salePrice")
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.stockIn = (req, res, next) => updateStock(req, res, next, "STOCK_IN")
exports.adjust = (req, res, next) => updateStock(req, res, next, "ADJUSTMENT")
