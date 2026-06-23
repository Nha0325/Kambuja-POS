const calculatePaymentStatus = require("../helper/calculatePaymentStatus")
const Product = require("../models/Product.model")
const Sale = require("../models/Sale.model")
const { generateInvoiceNumber } = require("./counter.controller")
const Inventory = require("../models/Inventory.model")
const StockMovement = require("../models/StockMovement.model")
const Payment = require("../models/Payment.model")
const Receipt = require("../models/Receipt.model")
const AuditLog = require("../models/AuditLog.model")
const runTransaction = require("../helper/runTransaction")
const { notifySaleCreated } = require("../services/notification.service")

const createHttpError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

exports.create = async (req, res, next) => {
    try {
        let {items, paidAmount} = req.body
        
        paidAmount = Number(paidAmount || 0);

        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty."
            });
        }

        if (!Number.isFinite(paidAmount) || paidAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount must be greater than or equal zero."
            });
        }

        const normalizedItems = []
        const quantityByProduct = new Map()

        for (const item of items) {
            const product = item?.product || item?.productId
            const quantity = Number(item?.quantity ?? item?.qty)

            if (!product || !Number.isFinite(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each sale item must include a valid product and quantity."
                })
            }

            const productKey = String(product)
            normalizedItems.push({ product, quantity })
            quantityByProduct.set(productKey, (quantityByProduct.get(productKey) || 0) + quantity)
        }

        //step 1: Fetch all products at once to validate stock and price
        const productIds = Array.from(quantityByProduct.keys());
        const products = await Product.find({
            _id: { $in: productIds },
            ...req.shopFilter,
        })

        const productById = new Map(products.map((product) => [product._id.toString(), product]))
        const saleItems = []
        let totalCost = 0

        //step 2: Validate stock and backend-owned prices for each product
        for(const [productId, quantity] of quantityByProduct.entries()){
            const product = productById.get(productId)
            if(!product){
                return res.status(404).json({
                    success:false,
                    message: `Product not found with ID: ${productId}`
                })
            }
            if(product.currentStock < quantity){
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                })
            }
            if(!Number.isFinite(Number(product.salePrice)) || Number(product.salePrice) < 0){
                return res.status(400).json({
                    success: false,
                    message: `Invalid sale price for product: ${product.name}`
                })
            }
        }

        for (const item of normalizedItems) {
            const product = productById.get(String(item.product))
            const unitPrice = Number(product.salePrice)
            const totalPrice = unitPrice * item.quantity

            saleItems.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
            })
            totalCost += totalPrice
        }

        if (!Number.isFinite(totalCost) || totalCost <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total cost must be greater than zero."
            });
        }
        
        //Step 3: Calculate payment status and generate invoice
        const paymentStatus = calculatePaymentStatus(totalCost, paidAmount)

        const savedSale = await runTransaction(async (session) => {
            const invoiceNumber = await generateInvoiceNumber(session)
            const sale = new Sale({
                shopId: req.shopId,
                user: req.user._id,
                items: saleItems,
                invoiceNumber,
                paymentStatus,
                dueAmount: Math.max(0, totalCost - paidAmount),
                changeAmount: Math.max(0, paidAmount - totalCost),
                paidAmount,
                totalCost,
            })
            await sale.save(session ? { session } : undefined)

            for (const item of saleItems) {
                const product = await Product.findOneAndUpdate(
                    { _id: item.product, ...req.shopFilter, currentStock: { $gte: item.quantity } },
                    { $inc: { currentStock: -item.quantity } },
                    { new: true, ...(session ? { session } : {}) }
                )
                if (!product) {
                    const productName = productById.get(String(item.product))?.name || item.product
                    throw createHttpError(400, `Insufficient stock for product: ${productName}`)
                }
                const quantityAfter = Number(product.currentStock)
                const quantityBefore = quantityAfter + Number(item.quantity)

                await Inventory.findOneAndUpdate(
                    { shopId: req.shopId, product: product._id },
                    { quantity: quantityAfter },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true,
                        ...(session ? { session } : {}),
                    }
                )
                await StockMovement.create([{
                    shopId: req.shopId,
                    product: product._id,
                    user: req.user._id,
                    type: "SALE",
                    quantity: -Number(item.quantity),
                    quantityBefore,
                    quantityAfter,
                    referenceType: "Sale",
                    referenceId: sale._id,
                }], session ? { session } : undefined)
            }

            if (paidAmount > 0) {
                await Payment.create([{
                    shopId: req.shopId,
                    sale: sale._id,
                    user: req.user._id,
                    amount: paidAmount,
                    method: "CASH",
                }], session ? { session } : undefined)
            }

            await Receipt.create([{
                shopId: req.shopId,
                sale: sale._id,
                receiptNumber: `RCT-${invoiceNumber}`,
                issuedBy: req.user._id,
            }], session ? { session } : undefined)

            await AuditLog.create([{
                shopId: req.shopId,
                user: req.user._id,
                action: "CREATE",
                entityType: "Sale",
                entityId: sale._id,
                metadata: { invoiceNumber, totalCost },
            }], session ? { session } : undefined)

            return sale
        })

        void notifySaleCreated(savedSale).catch(() => {})

        res.status(201).json({
            success: true,
            result: savedSale
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

        if (req.user && req.user.role === 'CASHIER') {
            querySearch.user = req.user._id;
        }

        if(req.query.search){
            querySearch["$or"] = [
                { $expr: { 
                    $regexMatch: { input: { $toString: "$invoiceNumber" }, regex: req.query.search, options: "i" } 
                }}
            ]
        }

        const docs = await Sale
                            .find(querySearch)
                            .populate("user","username name role")
                            .populate("items.product", "name imageUrl salePrice costPrice currentStock")
                            .skip(skip) 
                            .limit(limit)
                            .sort({_id: -1})
                            .exec()

        const totalItems = await Sale.countDocuments(querySearch)
        const totalPage = Math.ceil(totalItems / limit)

        res.status(200).json({
            success: true,
            totalPage,
            result: docs
        })
    } catch (error) {
        next(error)
    }
}

exports.findOne = async (req, res, next) => {
    try {
        const id = req.params.id
        const doc =await Sale
                          .findOne({ _id: id, ...req.shopFilter })
                            .populate("user","username name role")
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

exports.checkStock = async (req, res, next) => {
    try {

        const stock = req.query.stock * 1
        const product = req.query.product

        if(!stock || !product){
            return res.status(400).json({
                    success: false,
                    message: "Please provide stock and product"
                 })
        }

        const doc = await Product.findOne({ _id: product, ...req.shopFilter })
        if(!doc){
            return res.status(404).json({
                success: false,
                message: "Product not found!"
            })
        }
        if(doc.currentStock < stock){
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for product: ${doc.name}`
            })

        }

        res.status(200).json({
            success: true,
            result: "In stock"
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

        const sale = await Sale.findOne({ _id: id, ...req.shopFilter }).lean()
        if(!sale){
            return res.status(404).json({
                success: false,
                message: "Sale not found with that ID!"
            })
        } 

        const totalCost = Number(sale.totalCost || 0)
        const paidAmount = Number(sale.paidAmount || 0) + additionalPaid
        const updatedSale = await Sale.findOneAndUpdate(
            { _id: id, ...req.shopFilter },
            {
                paidAmount,
                dueAmount: Math.max(0, totalCost - paidAmount),
                changeAmount: Math.max(0, paidAmount - totalCost),
                paymentStatus: calculatePaymentStatus(totalCost, paidAmount)
            },
            { new: true, runValidators: true }
        )

        await Payment.create({
            shopId: req.shopId,
            sale: updatedSale._id,
            user: req.user._id,
            amount: additionalPaid,
            method: String(req.body?.method || "CASH").toUpperCase(),
        })

        res.status(200).json({
            success: true,
            result: updatedSale
        })

    } catch (error) {
        next(error)
    }
}

exports.findToday = async (req, res, next) => {
    try {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)

        const docs = await Sale.find({
            ...req.shopFilter,
            ...(req.user && req.user.role === 'CASHIER' ? { user: req.user._id } : {}),
            createdAt: { $gte: start, $lte: end },
        })
            .populate("user", "username role")
            .populate("items.product", "name code salePrice")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            result: docs,
        })
    } catch (error) {
        next(error)
    }
}
