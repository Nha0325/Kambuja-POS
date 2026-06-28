const Payment = require('../../models/payment/Payment.model')
const Sale = require('../../models/sales/Sale.model')
const calculatePaymentStatus = require('../../helper/calculatePaymentStatus')

exports.create = async (req, res, next) => {
    try {
        const amount = Number(req.body.amount)
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ success: false, error: "Valid amount is required" })
        }

        const sale = await Sale.findOne({ _id: req.body.saleId, ...req.shopFilter })
        if (!sale) {
            return res.status(404).json({ success: false, error: "Sale not found" })
        }

        const payment = await Payment.create({
            shopId: req.shopId,
            sale: sale._id,
            user: req.user._id,
            amount,
            method: String(req.body.method || "CASH").toUpperCase(),
        })

        sale.paidAmount = Number(sale.paidAmount || 0) + amount
        sale.dueAmount = Math.max(0, sale.totalCost - sale.paidAmount)
        sale.changeAmount = Math.max(0, sale.paidAmount - sale.totalCost)
        sale.paymentStatus = calculatePaymentStatus(sale.totalCost, sale.paidAmount)
        await sale.save()

        res.status(201).json({ success: true, result: payment })
    } catch (error) {
        next(error)
    }
}

exports.listBySale = async (req, res, next) => {
    try {
        const docs = await Payment.find({
            sale: req.params.saleId,
            ...req.shopFilter,
        }).populate("user", "username role").sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}
