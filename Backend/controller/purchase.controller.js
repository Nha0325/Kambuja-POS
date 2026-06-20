const calculatePaymentStatus = require("../helper/calculatePaymentStatus")
const Product = require("../models/Product.model")
const Purchase = require("../models/Purchase.model")
const { generateInvoiceNumber } = require("./counter.controller")

exports.create = async (req, res, next) => {
    try {
        const {items, totalCost, purchaseStatus, paidAmount, supplier, purchaseDate, note} = req.body

        if(!req.user?._id){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated."
            })
        }

        if(!supplier){
            return res.status(400).json({
                success: false,
                message: "Supplier is required."
            })
        }

        if(!["received", "ordered", "pending", "cancel"].includes(purchaseStatus)){
            return res.status(400).json({
                success: false,
                message: "Please select a valid purchase status."
            })
        }

        if(!Array.isArray(items) || items.length === 0){
            return res.status(400).json({
                success: false,
                message: "Please add at least one product to the purchase."
            })
        }

        const initialPaid = Number(paidAmount || 0)
        const cost = Number(totalCost || 0)

        if(!Number.isFinite(cost) || cost <= 0){
            return res.status(400).json({
                success: false,
                message: "Total cost must be greater than zero."
            })
        }

        const paymentStatus = calculatePaymentStatus(cost, initialPaid)

        let savedDoc;
        const maxAttempts = 10;

        // Generate unique invoice number and create purchase
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const invoiceNumber = await generateInvoiceNumber();
                
                savedDoc = await Purchase.create({
                    invoiceNumber,
                    supplier,
                    purchaseDate,
                    purchaseStatus,
                    note,
                    totalCost: cost,
                    paidAmount: initialPaid,
                    paymentStatus,
                    dueAmount: Math.max(0, cost - initialPaid),
                    changeAmount: Math.max(0, initialPaid - cost),
                    user: req.user?._id,
                    items,
                })

                break;
            } catch (error) {
                const isDuplicateInvoice = error.code === 11000 && error.keyPattern?.invoiceNumber;
                if (isDuplicateInvoice && attempt < maxAttempts - 1) {
                    continue;
                }
                throw error;
            }
        }

        // Update stock product if purchase status equal received
        if(purchaseStatus === "received"){
            for(const item of items){
                await Product.findByIdAndUpdate(item.product, { 
                    $inc: { currentStock: item.quantity } 
                });
            }
        }

        res.status(201).json({
            success: true,
            result: savedDoc
        })
    } catch (error) {
        next(error)
    }
}

exports.findAll = async (req, res, next) => {
    try {
        const page = req.query.page * 1 || 1
        const limit = req.query.limit * 1 || 10
        const skip = (page - 1) * limit
        const querySearch = {}

        if(req.query.search){
            querySearch["$or"] = [
                { $expr: { 
                    $regexMatch: { input: { $toString: "$invoiceNumber" }, regex: req.query.search, options: "i" } 
                }}
            ]
        }

        const docs = await Purchase
                            .find(querySearch)
                            .populate("user","username name role")
                            .populate("supplier", "businessName phone")
                            .populate("items.product", "name imageUrl salePrice costPrice currentStock")
                            .skip(skip) 
                            .limit(limit)
                            .sort({_id: -1})
                            .exec()

        const totalItems = await Purchase.find(querySearch).countDocuments()
        const totalPage = Math.ceil(totalItems / limit)

        res.status(200).json({
            success: true,
            totalPage,
            result: docs,
        })
    } catch (error) {
        next(error)
    }
} 

exports.findOne = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await Purchase
                          .findById(id)
                            .populate("user","username name role")
                            .populate("supplier", "businessName phone")
                            .populate("items.product", "name imageUrl salePrice costPrice currentStock")
        if(!doc){
            return res.status(404).json({
                success: false,
                message: "Document not found with that ID!"
            })
        }
        res.status(200).json({
            success: true,
            result: doc
        })
    } catch (error) {
        next(error)
    }
}

exports.updatePurchaseStatus = async (req, res, next) => {
    try {
        const id = req.params.id
        const {purchaseStatus} = req.body

        if(!["received", "ordered", "pending", "cancel"].includes(purchaseStatus)){
            return res.status(400).json({
                success: false,
                message: "Please provide a valid purchase status"
            })
        }

        const doc = await Purchase.findById(id)
        if(!doc){
            return res.status(404).json({
                success:false,
                message: "No document found with that ID!"
            })
        }

        // If the status is already the requested status, return success (Idempotent)
        if (doc.purchaseStatus === purchaseStatus) {
            return res.status(200).json({
                success: true,
                result: doc
            });
        }

        // 1. check if purchase status already received
        if(doc.purchaseStatus === "received"){
            return res.status(400).json({
                success: false,
                message: "Purchase status is already received"
            })
        }

        // 2. update stock
        if(purchaseStatus === "received"){
            for(const item of doc.items){
                await Product.findByIdAndUpdate(item.product, { 
                    $inc: { currentStock: item.quantity } 
                });
            }
        }

        const newDoc = await Purchase.findByIdAndUpdate(
            id,
            { purchaseStatus },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            result: newDoc
        })
    } catch (error) {
        next(error)
    }
}

exports.addPayment = async (req, res, next) => {
    try {
        const id = req.params.id
        const additionalPaid = Number(req.body?.paidAmount || 0)

        if(!Number.isFinite(additionalPaid) || additionalPaid <= 0){
            return res.status(400).json({
                success:false,
                message: "Please provide a valid paid amount!"
            })
        }

        const purchase = await Purchase.findById(id).lean()
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: "Purchase not found with that ID!"
            })
        } 

        const totalCost = Number(purchase.totalCost || 0)
        const paidAmount = Number(purchase.paidAmount || 0) + additionalPaid
        const updatedPurchase = await Purchase.findByIdAndUpdate(
            id,
            {
                paidAmount,
                dueAmount: Math.max(0, totalCost - paidAmount),
                changeAmount: Math.max(0, paidAmount - totalCost),
                paymentStatus: calculatePaymentStatus(totalCost, paidAmount)
            },
            { new: true, runValidators: true }
        )

        res.status(200).json({
            success: true,
            result: updatedPurchase
        })

    } catch (error) {
        next(error)
    }
}
