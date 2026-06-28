const Inventory = require('../models/inventory/Inventory.model')
const Location = require('../models/system/Location.model')
const StockMovement = require('../models/misc/StockMovement.model')

const getProductStock = (product) => {
    return Number(product?.stock ?? product?.currentStock ?? 0)
}

const setProductStock = (product, stock) => {
    const value = Number(stock)
    product.stock = value
    product.currentStock = value
}

const getLowStockThreshold = (product) => {
    return Number(product?.lowStockThreshold ?? product?.lowStockThresholdBase ?? product?.reorderLevel ?? 5)
}

const getDefaultLocationId = async (shopId, session = null) => {
    if (!shopId) return null

    const query = Location.findOne({ shop: shopId }).sort({ isDefault: -1, createdAt: 1 })
    if (session) query.session(session)
    const existing = await query
    if (existing) return existing._id

    const docs = await Location.create([{
        shop: shopId,
        name: "Main Location",
        isDefault: true,
        type: "Branch",
    }], session ? { session } : undefined)

    return docs[0]._id
}

const syncInventory = async ({ shopId, locationId, product, stock, session = null }) => {
    if (!shopId || !locationId || !product?._id) return null

    return Inventory.findOneAndUpdate(
        { shopId, locationId, product: product._id },
        {
            $set: {
                quantity: Number(stock),
                reorderLevel: getLowStockThreshold(product),
            },
            $setOnInsert: {
                shopId,
                locationId,
                product: product._id,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            ...(session ? { session } : {}),
        }
    )
}

const createStockMovement = async ({
    shopId,
    locationId,
    product,
    type,
    qtyChange,
    beforeQty,
    afterQty,
    userId,
    supplierId,
    invoiceNo,
    reason,
    note,
    referenceType,
    referenceId,
    session = null,
}) => {
    const quantity = Number(qtyChange)
    const productId = product?._id || product
    const docs = await StockMovement.create([{
        shopId,
        locationId,
        product: productId,
        productId,
        user: userId,
        createdBy: userId,
        type,
        quantity,
        qtyChange: quantity,
        quantityBefore: Number(beforeQty),
        beforeQty: Number(beforeQty),
        quantityAfter: Number(afterQty),
        afterQty: Number(afterQty),
        supplierId,
        invoiceNo,
        reason,
        referenceType,
        referenceId,
        note: note || "",
    }], session ? { session } : undefined)

    return docs[0]
}

module.exports = {
    getProductStock,
    setProductStock,
    getLowStockThreshold,
    getDefaultLocationId,
    syncInventory,
    createStockMovement,
}
