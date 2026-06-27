const Inventory = require("../models/Inventory.model")
const Product = require("../models/Product.model")
const StockMovement = require("../models/StockMovement.model")
const NotificationLog = require("../models/NotificationLog.model")
const Shop = require("../models/Shop.model")
const { writeAuditLog } = require("../helper/audit")
const { checkStockAndAlert } = require("../helper/alert.helper")

const ADJUSTMENT_REASONS = ["Damaged", "Lost", "Expired", "Manual Correction", "Stock Count", "Other"]

const validationError = (res, message) => (
    res.status(400).json({ success: false, message, error: message })
)

const notFound = (res, message) => (
    res.status(404).json({ success: false, message, error: message })
)

const isPositiveNumber = (value) => Number.isFinite(value) && value > 0

const resolveShopId = (req, product) => req.shopId || product.shopId || req.user?.shopId
const resolveLocationId = (req) => req.body.locationId || req.query.locationId || req.locationId

const buildNote = (note, details = []) => {
    const values = details.filter(Boolean)
    if (!note && values.length === 0) return ""
    if (!note) return values.join(" | ")
    if (values.length === 0) return note
    return `${note} | ${values.join(" | ")}`
}

const updateInventory = async (shopId, locationId, productId, quantity, body = {}) => {
    return Inventory.findOneAndUpdate(
        { shopId, locationId, product: productId },
        {
            $set: {
                quantity,
                ...(body.reorderLevel !== undefined ? { reorderLevel: Number(body.reorderLevel) } : {}),
                ...(body.maxStock !== undefined ? { maxStock: Number(body.maxStock) } : {}),
            },
            $setOnInsert: {
                shopId,
                locationId,
                product: productId,
            },
        },
        { new: true, upsert: true, runValidators: true }
    ).populate({
        path: "product",
        select: "name code imageUrl costPrice salePrice currentStock category supplier",
        populate: { path: "category", select: "name" },
    })
}

const notifyLowStockIfNeeded = async ({ shopId, product, inventory, quantityBefore, quantityAfter }) => {
    const maxStock = Number(inventory?.maxStock || 0)
    const reorderLevel = Number(inventory?.reorderLevel || 0)
    const isLowNow = maxStock > 0 ? quantityAfter <= maxStock * 0.5 : quantityAfter <= reorderLevel
    const wasLowBefore = maxStock > 0 ? quantityBefore <= maxStock * 0.5 : quantityBefore <= reorderLevel

    if (!isLowNow || wasLowBefore) return

    const shop = await Shop.findById(shopId)
    if (!shop) return

    await NotificationLog.create({
        shopId,
        eventType: "LOW_STOCK_50",
        status: "PENDING",
        message: `${product.name} stock is below 50% in ${shop.name}`,
    })
}

const createStockMovement = async ({
    req,
    shopId,
    locationId,
    product,
    type,
    quantity,
    quantityBefore,
    quantityAfter,
    note,
    referenceType,
}) => {
    return StockMovement.create({
        shopId,
        locationId,
        product: product._id,
        user: req.user._id || req.user.id,
        type,
        quantity,
        quantityBefore,
        quantityAfter,
        referenceType,
        note: note || "",
    })
}

exports.list = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId
        const docs = await Inventory.find(filter)
            .populate("shopId", "name code")
            .populate("locationId", "name code")
            .populate({
                path: "product",
                select: "name code imageUrl costPrice salePrice currentStock category supplier",
                populate: { path: "category", select: "name" },
            })
            .sort({ updatedAt: -1 })

        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.overview = exports.list

exports.movements = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId
        const docs = await StockMovement.find(filter)
            .populate("shopId", "name code")
            .populate("locationId", "name code")
            .populate("product", "name code imageUrl currentStock")
            .populate("user", "username name role")
            .sort({ createdAt: -1 })
            .limit(500)

        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.lowStock = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId
        const docs = await Inventory.find({
            ...filter,
            $expr: { $lte: ["$quantity", "$reorderLevel"] },
        }).populate("product", "name code imageUrl salePrice")

        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.lowStock50 = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId
        const docs = await Inventory.find({
            ...filter,
            $or: [
                {
                    $and: [
                        { maxStock: { $gt: 0 } },
                        { $expr: { $lte: ["$quantity", { $multiply: ["$maxStock", 0.5] }] } },
                    ],
                },
                {
                    $and: [
                        { $or: [{ maxStock: { $exists: false } }, { maxStock: 0 }] },
                        { $expr: { $lte: ["$quantity", "$reorderLevel"] } },
                    ],
                },
            ],
        })
            .populate("product", "name code imageUrl salePrice")
            .populate("shopId", "name code")
            .populate("locationId", "name code")

        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.stockIn = async (req, res, next) => {
    try {
        const { productId, supplierId, referenceNumber, note } = req.body
        const quantity = Number(req.body.quantity)
        const unitCost = req.body.unitCost === undefined || req.body.unitCost === ""
            ? undefined
            : Number(req.body.unitCost)

        if (!productId) {
            return validationError(res, "productId is required")
        }

        if (!isPositiveNumber(quantity)) {
            return validationError(res, "Quantity must be greater than 0")
        }

        if (unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) {
            return validationError(res, "Unit cost must be greater than or equal to 0")
        }

        const product = await Product.findOne({ _id: productId, ...req.shopFilter })
        if (!product) {
            return notFound(res, "Product not found")
        }

        const shopId = resolveShopId(req, product)
        let locationId = resolveLocationId(req)
        
        if (!locationId && shopId) {
            const Location = require("../models/Location.model")
            const defaultLoc = await Location.findOne({ shop: shopId }).sort({ isDefault: -1 })
            if (defaultLoc) {
                locationId = defaultLoc._id
            } else {
                const newLoc = await Location.create({ shop: shopId, name: "Main Location", isDefault: true, type: "Branch" })
                locationId = newLoc._id
            }
        }
        
        const userId = req.user?._id || req.user?.id
        if (!shopId || !locationId || !userId) {
            return res.status(400).json({ success: false, message: "Shop ID, Location ID, and User ID are required", error: "Missing required scope identifiers" })
        }

        const quantityBefore = Number(product.currentStock || 0)
        const quantityAfter = quantityBefore + quantity

        product.currentStock = quantityAfter
        await product.save()
        void checkStockAndAlert(product);

        const inventory = await updateInventory(shopId, locationId, product._id, quantityAfter, req.body)
        await notifyLowStockIfNeeded({ shopId, product, inventory, quantityBefore, quantityAfter })

        await createStockMovement({
            req,
            shopId,
            locationId,
            product,
            type: "STOCK_IN",
            quantity,
            quantityBefore,
            quantityAfter,
            referenceType: "StockIn",
            note: buildNote(note, [
                supplierId ? `Supplier ID: ${supplierId}` : "",
                referenceNumber ? `Reference: ${referenceNumber}` : "",
                unitCost !== undefined ? `Unit Cost: ${unitCost}` : "",
            ]),
        })

        await writeAuditLog(req, "STOCK_IN", "Product", product._id, {
            quantity,
            quantityAfter,
            referenceNumber,
        })

        return res.status(200).json({
            success: true,
            result: inventory,
            product,
            message: "Stock in success",
        })
    } catch (error) {
        console.error("stockIn Error:", error)
        next(error)
    }
}

exports.adjustment = async (req, res, next) => {
    try {
        const { productId, note } = req.body
        const type = String(req.body.type || "").toUpperCase()
        const quantity = Number(req.body.quantity)
        const reason = String(req.body.reason || "").trim()

        if (!productId) {
            return validationError(res, "productId is required")
        }

        if (!["INCREASE", "DECREASE"].includes(type)) {
            return validationError(res, "Adjustment type must be INCREASE or DECREASE")
        }

        if (!isPositiveNumber(quantity)) {
            return validationError(res, "Quantity must be greater than 0")
        }

        if (!ADJUSTMENT_REASONS.includes(reason)) {
            return validationError(res, "Please select a valid adjustment reason")
        }

        const product = await Product.findOne({ _id: productId, ...req.shopFilter })
        if (!product) {
            return notFound(res, "Product not found")
        }

        const shopId = resolveShopId(req, product)
        let locationId = resolveLocationId(req)

        if (!locationId && shopId) {
            const Location = require("../models/Location.model")
            const defaultLoc = await Location.findOne({ shop: shopId }).sort({ isDefault: -1 })
            if (defaultLoc) {
                locationId = defaultLoc._id
            } else {
                const newLoc = await Location.create({ shop: shopId, name: "Main Location", isDefault: true, type: "Branch" })
                locationId = newLoc._id
            }
        }

        const userId = req.user?._id || req.user?.id
        if (!shopId || !locationId || !userId) {
            return res.status(400).json({ success: false, message: "Shop ID, Location ID, and User ID are required", error: "Missing required scope identifiers" })
        }

        const quantityBefore = Number(product.currentStock || 0)
        const delta = type === "INCREASE" ? quantity : -quantity
        const quantityAfter = quantityBefore + delta

        if (quantityAfter < 0) {
            return validationError(res, "Adjustment cannot make stock negative")
        }

        product.currentStock = quantityAfter
        await product.save()
        void checkStockAndAlert(product);

        const inventory = await updateInventory(shopId, locationId, product._id, quantityAfter, req.body)
        await notifyLowStockIfNeeded({ shopId, product, inventory, quantityBefore, quantityAfter })

        await createStockMovement({
            req,
            shopId,
            locationId,
            product,
            type: "ADJUSTMENT",
            quantity: delta,
            quantityBefore,
            quantityAfter,
            referenceType: "Adjustment",
            note: buildNote(note, [`Reason: ${reason}`, `Type: ${type}`]),
        })

        await writeAuditLog(req, "ADJUSTMENT", "Product", product._id, {
            type,
            quantity: delta,
            quantityAfter,
            reason,
        })

        return res.status(200).json({
            success: true,
            result: inventory,
            product,
            message: "Stock adjusted successfully",
        })
    } catch (error) {
        console.error("adjustment Error:", error)
        next(error)
    }
}

exports.adjust = exports.adjustment
