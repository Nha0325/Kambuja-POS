const calculatePaymentStatus = require('../../helper/calculatePaymentStatus')
const Product = require('../../models/inventory/Product.model')
const Purchase = require('../../models/purchase/Purchase.model')
const { generateInvoiceNumber } = require('../system/counter.controller')
const {
    getProductStock,
    setProductStock,
    getDefaultLocationId,
    syncInventory,
    createStockMovement,
} = require('../../helper/stock.helper')

const applyReceivedStock = async (req, purchase, items) => {
    for(const item of items){
        const product = await Product.findOne({ _id: item.product, ...req.shopFilter })
        if (!product) {
            throw new Error(`Product not found with ID: ${item.product}`)
        }

        const qtyChange = Number(item.convertedQtyBase || item.quantity)
        const quantityBefore = getProductStock(product)
        const quantityAfter = quantityBefore + qtyChange
        const locationId = await getDefaultLocationId(req.shopId)

        setProductStock(product, quantityAfter)
        await product.save()
        await syncInventory({ shopId: req.shopId, locationId, product, stock: quantityAfter })
        await createStockMovement({
            shopId: req.shopId,
            locationId,
            product: product._id,
            userId: req.user._id,
            type: "RECEIVE_STOCK",
            qtyChange,
            beforeQty: quantityBefore,
            afterQty: quantityAfter,
            supplierId: purchase.supplier,
            invoiceNo: purchase.invoiceNumber,
            reason: "Supplier stock in",
            referenceType: "Purchase",
            referenceId: purchase._id,
            note: "Purchase received",
        })
    }
}

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
                    shopId: req.shopId,
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
            await applyReceivedStock(req, savedDoc, items)
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
        const querySearch = { ...req.shopFilter }

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
                            .populate("items.product", "name imageUrl salePrice costPrice stock currentStock")
                            .skip(skip) 
                            .limit(limit)
                            .sort({_id: -1})
                            .exec()

        const totalItems = await Purchase.countDocuments(querySearch)
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
                          .findOne({ _id: id, ...req.shopFilter })
                            .populate("user","username name role")
                            .populate("supplier", "businessName phone")
                            .populate("items.product", "name imageUrl salePrice costPrice stock currentStock")
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

        const doc = await Purchase.findOne({ _id: id, ...req.shopFilter })
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
            await applyReceivedStock(req, doc, doc.items)
        }

        const newDoc = await Purchase.findOneAndUpdate(
            { _id: id, ...req.shopFilter },
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

        const purchase = await Purchase.findOne({ _id: id, ...req.shopFilter }).lean()
        if(!purchase){
            return res.status(404).json({
                success: false,
                message: "Purchase not found with that ID!"
            })
        } 

        const totalCost = Number(purchase.totalCost || 0)
        const paidAmount = Number(purchase.paidAmount || 0) + additionalPaid
        const updatedPurchase = await Purchase.findOneAndUpdate(
            { _id: id, ...req.shopFilter },
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
