const StockMovement = require("../models/StockMovement.model")

exports.list = async (req, res, next) => {
    try {
        const docs = await StockMovement.find(req.shopFilter)
            .populate("product", "name code")
            .populate("user", "username role")
            .sort({ createdAt: -1 })
            .limit(500)
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}
