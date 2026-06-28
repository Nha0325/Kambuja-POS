const Inventory = require('../../models/inventory/Inventory.model')
const Product = require('../../models/inventory/Product.model')
const StockMovement = require('../../models/misc/StockMovement.model')
const NotificationLog = require('../../models/engagement/NotificationLog.model')
const Shop = require('../../models/system/Shop.model')
const { writeAuditLog } = require('../../helper/audit')
const { checkStockAndAlert } = require('../../helper/alert.helper')

const runTransaction = require('../../helper/runTransaction')
const {
    getProductStock,
    setProductStock,
    getLowStockThreshold,
    getDefaultLocationId,
    syncInventory,
    createStockMovement,
} = require('../../helper/stock.helper')

const ADJUSTMENT_REASONS = ["Damaged", "Expired", "Lost", "Physical count correction", "Return from customer", "Other", "Missing", "Manual Correction", "Count Correction", "Stock Count", "Opening Balance"]

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

const getStockStatus = (stock, lowStockThreshold) => {
    if (stock <= 0) return "OUT_OF_STOCK"
    if (stock <= lowStockThreshold) return "LOW_STOCK"
    return "IN_STOCK"
}

const mapInventoryProduct = (product) => {
    const stock = getProductStock(product)
    const lowStockThreshold = getLowStockThreshold(product)

    return {
        _id: product._id,
        productId: product._id,
        productName: product.name,
        sku: product.sku || product.code,
        barcode: product.barcode,
        category: product.category,
        supplier: product.supplier,
        stock,
        quantity: stock,
        currentStock: stock,

        lowStockThreshold,
        reorderLevel: lowStockThreshold,
        stockStatus: getStockStatus(stock, lowStockThreshold),
        product,
        shopId: product.shopId,
        updatedAt: product.updatedAt,
    }
}

exports.list = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId
        const docs = await Product.find({ ...filter, isDeleted: { $ne: true } })
            .populate("shopId", "name code")
            .populate("category", "name")
            .populate("supplier", "name")
            .sort({ updatedAt: -1 })

        const mappedDocs = docs.map(mapInventoryProduct)

        res.status(200).json({ success: true, result: mappedDocs })
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
            .populate("product", "name code sku barcode imageUrl stock currentStock")
            .populate("user", "username name role")
            .populate("createdBy", "username name role")
            .populate("supplierId", "name businessName")
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
        const docs = await Product.find({
            ...filter,
            isDeleted: { $ne: true },
            $expr: {
                $lte: [
                    { $ifNull: ["$stock", "$currentStock"] },
                    { $ifNull: ["$lowStockThreshold", { $ifNull: ["$reorderLevel", 5] }] },
                ],
            },
        })
            .populate("shopId", "name code")
            .populate("category", "name")
            .populate("supplier", "name")
            .sort({ updatedAt: -1 })

        const mappedDocs = docs.map(mapInventoryProduct)

        res.status(200).json({ success: true, result: mappedDocs })
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
        const { productId, supplierId, note } = req.body
        const invoiceNo = req.body.invoiceNo || req.body.referenceNo || req.body.referenceNumber
        const quantityPurchaseUnit = Number(req.body.quantityPurchaseUnit ?? req.body.quantity)
        const costPrice = req.body.costPerPurchaseUnit !== undefined
            ? req.body.costPerPurchaseUnit
            : req.body.costPrice !== undefined
                ? req.body.costPrice
                : req.body.unitCost
        const unitCost = costPrice === undefined || costPrice === ""
            ? undefined
            : Number(costPrice)

        if (!productId) {
            return validationError(res, "productId is required")
        }

        if (!isPositiveNumber(quantityPurchaseUnit)) {
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
        if (!locationId) locationId = await getDefaultLocationId(shopId)

        const userId = req.user?._id || req.user?.id
        if (!shopId || !locationId || !userId) {
            return res.status(400).json({ success: false, message: "Shop ID, Location ID, and User ID are required", error: "Missing required scope identifiers" })
        }

        const quantityBefore = getProductStock(product)
        const convertedQtyBase = Number(req.body.totalBaseQty !== undefined ? req.body.totalBaseQty : quantityPurchaseUnit)

        if (!isPositiveNumber(convertedQtyBase)) {
            return validationError(res, "Total base quantity must be greater than 0")
        }

        const quantityAfter = quantityBefore + convertedQtyBase

        setProductStock(product, quantityAfter)
        await runTransaction(async (session) => {
            await product.save(session ? { session } : undefined)
            await syncInventory({ shopId, locationId, product, stock: quantityAfter, session })
            await createStockMovement({
                shopId,
                locationId,
                product,
                type: "RECEIVE_STOCK",
                qtyChange: convertedQtyBase,
                beforeQty: quantityBefore,
                afterQty: quantityAfter,
                userId,
                supplierId,
                invoiceNo,
                reason: "Supplier stock in",

                referenceType: "ReceiveStock",
                note: buildNote(note, [
                    supplierId ? `Supplier ID: ${supplierId}` : "",
                    invoiceNo ? `Invoice: ${invoiceNo}` : "",
                    unitCost !== undefined ? `Cost Per Purchase Unit: ${unitCost}` : "",
                    req.body.receivedDate ? `Received Date: ${req.body.receivedDate}` : "",
                ]),
                session,
            })
        })
        void checkStockAndAlert(product);

        const inventory = await syncInventory({ shopId, locationId, product, stock: quantityAfter })
        await notifyLowStockIfNeeded({ shopId, product, inventory, quantityBefore, quantityAfter })

        await writeAuditLog(req, "RECEIVE_STOCK", "Product", product._id, {
            quantity: convertedQtyBase,
            quantityAfter,
            invoiceNo,
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
        const adjustmentType = String(req.body.adjustmentType || type).toUpperCase()
        const reason = String(req.body.reason || "").trim()

        if (!productId) {
            return validationError(res, "productId is required")
        }

        if (!["INCREASE", "DECREASE", "SET STOCK", "SET_STOCK", "SET_EXACT"].includes(adjustmentType)) {
            return validationError(res, "Adjustment type must be INCREASE, DECREASE, or SET_EXACT")
        }

        let quantity = Number(req.body.quantity)
        if (!["SET STOCK", "SET_STOCK", "SET_EXACT"].includes(adjustmentType)) {
            if (!isPositiveNumber(quantity)) {
                return validationError(res, "Quantity must be greater than 0")
            }
        } else if (!Number.isFinite(quantity) || quantity < 0) {
            return validationError(res, "Exact stock quantity must be greater than or equal to 0")
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
        if (!locationId) locationId = await getDefaultLocationId(shopId)

        const userId = req.user?._id || req.user?.id
        if (!shopId || !locationId || !userId) {
            return res.status(400).json({ success: false, message: "Shop ID, Location ID, and User ID are required", error: "Missing required scope identifiers" })
        }

        const quantityBefore = getProductStock(product)

        const convertedQtyBase = Number(quantity)

        let delta = 0
        if (["SET STOCK", "SET_STOCK", "SET_EXACT"].includes(adjustmentType)) {
            delta = convertedQtyBase - quantityBefore
        } else {
            delta = adjustmentType === "INCREASE" ? convertedQtyBase : -convertedQtyBase
        }

        const quantityAfter = quantityBefore + delta

        if (quantityAfter < 0) {
            return validationError(res, "Adjustment cannot make stock negative")
        }

        setProductStock(product, quantityAfter)
        await runTransaction(async (session) => {
            await product.save(session ? { session } : undefined)
            await syncInventory({ shopId, locationId, product, stock: quantityAfter, session })
            await createStockMovement({
                shopId,
                locationId,
                product,
                type: "STOCK_ADJUSTMENT",
                qtyChange: delta,
                beforeQty: quantityBefore,
                afterQty: quantityAfter,
                userId,
                reason,

                referenceType: "StockAdjustment",
                note: buildNote(note, [`Reason: ${reason}`, `Type: ${adjustmentType}`]),
                session,
            })
        })
        void checkStockAndAlert(product);

        const inventory = await syncInventory({ shopId, locationId, product, stock: quantityAfter })
        await notifyLowStockIfNeeded({ shopId, product, inventory, quantityBefore, quantityAfter })

        await writeAuditLog(req, "STOCK_ADJUSTMENT", "Product", product._id, {
            type: adjustmentType,
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
