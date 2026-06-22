const Shop = require("../models/Shop.model")
const { writeAuditLog } = require("../helper/audit")

exports.getOwnShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.user.shopId)
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}

exports.updateOwnShop = async (req, res, next) => {
    try {
        const { code, status, createdBy, ...allowedUpdates } = req.body
        const shop = await Shop.findByIdAndUpdate(
            req.user.shopId,
            allowedUpdates,
            { new: true, runValidators: true }
        )
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        await writeAuditLog(req, "UPDATE", "Shop", shop._id)
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}
