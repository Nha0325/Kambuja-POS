const Receipt = require("../models/Receipt.model")
const Sale = require("../models/Sale.model")

const buildReceiptNumber = (sale) => `RCT-${sale.invoiceNumber}`

exports.issue = async (req, res, next) => {
    try {
        const sale = await Sale.findOne({ _id: req.params.saleId, ...req.shopFilter })
        if (!sale) {
            return res.status(404).json({ success: false, error: "Sale not found" })
        }

        const receipt = await Receipt.findOneAndUpdate(
            { sale: sale._id, shopId: req.shopId },
            {
                $setOnInsert: {
                    shopId: req.shopId,
                    sale: sale._id,
                    receiptNumber: buildReceiptNumber(sale),
                    issuedBy: req.user._id,
                },
            },
            { new: true, upsert: true, runValidators: true }
        ).populate("sale").populate("issuedBy", "username role")

        res.status(201).json({ success: true, result: receipt })
    } catch (error) {
        next(error)
    }
}

exports.getBySale = async (req, res, next) => {
    try {
        const receipt = await Receipt.findOne({
            sale: req.params.saleId,
            ...req.shopFilter,
        }).populate({
            path: "sale",
            populate: [
                { path: "items.product", select: "name code salePrice" },
                { path: "user", select: "username role" },
            ],
        })
        if (!receipt) {
            return res.status(404).json({ success: false, error: "Receipt not found" })
        }
        return res.status(200).json({ success: true, result: receipt })
    } catch (error) {
        next(error)
    }
}

exports.markPrinted = async (req, res, next) => {
    try {
        const receipt = await Receipt.findOneAndUpdate(
            { sale: req.params.saleId, ...req.shopFilter },
            { printedAt: new Date() },
            { new: true }
        )
        if (!receipt) {
            return res.status(404).json({ success: false, error: "Receipt not found" })
        }
        return res.status(200).json({ success: true, result: receipt })
    } catch (error) {
        next(error)
    }
}
