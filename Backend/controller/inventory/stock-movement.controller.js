const StockMovement = require('../../models/misc/StockMovement.model')

exports.list = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter }
        if (req.query.productId) {
            filter.$or = [
                { product: req.query.productId },
                { productId: req.query.productId }
            ]
        }
        
        const docs = await StockMovement.find(filter)
            .populate("product", "name code sku barcode imageUrl stock currentStock")
            .populate("user", "username role")
            .populate("createdBy", "username role")
            .populate("supplierId", "name businessName")
            .sort({ createdAt: -1 })
            .limit(500)
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}
