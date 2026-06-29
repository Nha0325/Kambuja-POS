const calculatePaymentStatus = require('../../helper/calculatePaymentStatus')
const Product = require('../../models/inventory/Product.model')
const Sale = require('../../models/sales/Sale.model')
const DailyClose = require('../../models/sales/DailyClose.model')
const { generateInvoiceNumber } = require('../system/counter.controller')
const Payment = require('../../models/payment/Payment.model')
const Receipt = require('../../models/sales/Receipt.model')
const AuditLog = require('../../models/misc/AuditLog.model')
const runTransaction = require('../../helper/runTransaction')
const { checkStockAndAlert } = require('../../helper/alert.helper')

const { notifySaleCreated } = require('../../services/notification.service')
const {
    getProductStock,
    setProductStock,
    getDefaultLocationId,
    syncInventory,
    createStockMovement,
} = require('../../helper/stock.helper')

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
            quantityByProduct.set(productKey, (quantityByProduct.get(productKey) || 0) + quantity) // this is just for fetching, not exact base quantity
        }

        //step 1: Fetch all products at once to validate stock and price
        const productIds = Array.from(quantityByProduct.keys());
        const products = await Product.find({
            _id: { $in: productIds },
            ...req.shopFilter,
        })

        const productById = new Map(products.map((product) => [product._id.toString(), product]))
        const saleItems = []
        const requiredQtyByProduct = new Map()
        let totalCost = 0

        //step 2: Validate stock and backend-owned prices for each product
        for (const item of normalizedItems) {
            const product = productById.get(String(item.product))
            if(!product){
                return res.status(404).json({
                    success:false,
                    message: `Product not found with ID: ${item.product}`
                })
            }
            const convertedQtyBase = Number(item.quantity);

            requiredQtyByProduct.set(
                String(product._id),
                (requiredQtyByProduct.get(String(product._id)) || 0) + convertedQtyBase
            )
            if(!Number.isFinite(Number(product.salePrice)) || Number(product.salePrice) < 0){
                return res.status(400).json({
                    success: false,
                    message: `Invalid sale price for product: ${product.name}`
                })
            }

            item.convertedQtyBase = convertedQtyBase;
        }

        for (const [productId, requiredQty] of requiredQtyByProduct.entries()) {
            const product = productById.get(productId)
            const currentStockBase = getProductStock(product)

            if(currentStockBase < requiredQty){
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                })
            }
        }

        for (const item of normalizedItems) {
            const product = productById.get(String(item.product))
            const unitPrice = Number(product.salePrice) // Should use the frontend provided one, wait, no, frontend provides it but we override it here. Wait, what about saleUnit?
            const actualUnitPrice = Number(product.salePrice);
            const totalPrice = actualUnitPrice * item.quantity

            const costPerUnit = Number(product.costPrice || 0);
            const totalCostValue = costPerUnit * item.convertedQtyBase;
            const profit = totalPrice - totalCostValue;

            saleItems.push({
                product: product._id,
                quantity: item.quantity,
                convertedQtyBase: item.convertedQtyBase,
                pricePerUnit: actualUnitPrice,
                profit,
                unitPrice: actualUnitPrice,
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
            const locationId = await getDefaultLocationId(req.shopId, session)
            const workingStock = new Map(
                products.map((product) => [product._id.toString(), getProductStock(product)])
            )
            const sale = new Sale({
                shopId: req.shopId,
                locationId,
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
                const productId = String(item.product)
                const quantityBefore = workingStock.get(productId)
                const quantityAfter = quantityBefore - Number(item.convertedQtyBase)
                if (quantityAfter < 0) {
                    const productName = productById.get(productId)?.name || item.product
                    throw createHttpError(400, `Insufficient stock for product: ${productName}`)
                }

                const stockMatch = {
                    _id: item.product,
                    ...req.shopFilter,
                    $or: [
                        { stock: quantityBefore },
                        { stock: { $exists: false }, stockQtyBase: quantityBefore },
                        { stock: { $exists: false }, stockQtyBase: { $exists: false }, currentStock: quantityBefore },
                    ],
                }
                const product = await Product.findOneAndUpdate(
                    stockMatch,
                    { $set: { stock: quantityAfter, currentStock: quantityAfter, stockQtyBase: quantityAfter } },
                    { new: true, ...(session ? { session } : {}) }
                )
                if (!product) {
                    const productName = productById.get(String(item.product))?.name || item.product
                    throw createHttpError(400, `Insufficient stock for product: ${productName}`)
                }
                setProductStock(product, quantityAfter)
                workingStock.set(productId, quantityAfter)

                void checkStockAndAlert(product);

                await syncInventory({ shopId: req.shopId, locationId, product, stock: quantityAfter, session })
                await createStockMovement({
                    shopId: req.shopId,
                    locationId,
                    product,
                    userId: req.user._id,
                    type: "SALE",
                    qtyChange: -Number(item.convertedQtyBase),

                    beforeQty: quantityBefore,
                    afterQty: quantityAfter,
                    reason: "POS sale",
                    referenceType: "Sale",
                    referenceId: sale._id,
                    note: `POS sale ${invoiceNumber}`,
                    session,
                })
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
                            .populate("items.product", "name imageUrl salePrice costPrice stock currentStock")
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

        // Always validate using base quantity in case we are passed multiple purchase unit combinations
        const currentStockBase = getProductStock(doc);

        if(currentStockBase < stock){
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



exports.findToday = async (req, res, next) => {
    try {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)

        // For CASHIER: only show sales since last shift close today
        let salesStart = start;
        if (req.user && req.user.role === 'CASHIER') {
            const lastClose = await DailyClose.findOne({
                shopId: req.shopId,
                cashier: req.user._id,
                status: 'CLOSED',
                createdAt: { $gte: start, $lte: end }
            }).sort({ closedAt: -1 });
            if (lastClose && lastClose.closedAt) {
                salesStart = new Date(lastClose.closedAt);
            }
        }

        const docs = await Sale.find({
            ...req.shopFilter,
            ...(req.user && req.user.role === 'CASHIER' ? { user: req.user._id } : {}),
            createdAt: { $gt: salesStart, $lte: end },
        })
            .populate("user", "username role")
            .populate("items.product", "name code salePrice stock currentStock")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            result: docs,
        })
    } catch (error) {
        next(error)
    }
}
