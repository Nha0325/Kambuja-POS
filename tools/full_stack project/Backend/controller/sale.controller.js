const calculatePaymentStatus = require("../helper/calculatePaymentStatus")
const Product = require("../models/Product.model")
const Sale = require("../models/Sale.model")
const { generateInvoiceNumber } = require("./counter.controller")

exports.create = async (req, res, next) => {
    try {
        let {items, totalCost, paidAmount, customer} = req.body
        
        paidAmount = Number(paidAmount || 0);
        totalCost = Number(totalCost || 0);

        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not authenticated."
            });
        }

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: "Please select a customer."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty."
            });
        }

        if (!Number.isFinite(totalCost) || totalCost <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total cost must be greater than zero."
            });
        }

        //step 1: Fetch all products at once to validate stock
        const productIds = items.map(it => it.product).filter(id => id);
        const products = await Product.find({_id: { $in: productIds}})

        //step 2: Validate stock for each product
        for(const item of items){
            const product = products.find(
                (p) => p._id.toString() === item.product.toString()
            )
            if(!product){
                return res.status(404).json({
                    success:false,
                    message: `Product not found with ID: ${item.product}`
                })
            }
            if(product.currentStock < item.quantity){
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                })
            }
        }
        
        //Step 3: Calculate payment status and generate invoice
        const paymentStatus = calculatePaymentStatus(totalCost, paidAmount)

        let savedSale;
        const maxAttempts = 10; // Increase attempts to skip small gaps

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const invoiceNumber = await generateInvoiceNumber();
                
                savedSale = await Sale.create({
                    user: req.user._id,
                    customer,
                    items,
                    invoiceNumber,
                    paymentStatus,
                    dueAmount: Math.max(0, totalCost - paidAmount),
                    changeAmount: Math.max(0, paidAmount - totalCost),
                    paidAmount,
                    totalCost,
                });
                
                break; // Success, exit retry loop
            } catch (error) {
                // If it's a duplicate key error and we have attempts left, retry
                const isDuplicateInvoice = error.code === 11000 && error.keyPattern?.invoiceNumber;
                if (isDuplicateInvoice && attempt < maxAttempts - 1) {
                    continue;
                }
                throw error; // Re-throw if it's a different error or we're out of retries
            }
        }

        if (!savedSale) {
            throw new Error("Max attempts reached: Could not generate a unique invoice number. Please sync counters.");
        }

        // Step 6: Update stock only after sale is successfully recorded
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { 
                $inc: { currentStock: -item.quantity } 
            });
        }

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
        const querySearch = {}

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
                            .populate("customer", "name phone")
                            .populate("items.product", "name imageUrl salePrice costPrice currentStock")
                            .skip(skip) 
                            .limit(limit)
                            .sort({_id: -1})
                            .exec()

        const totalItems = await Sale.find(querySearch).countDocuments()
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
                          .findById(id)
                            .populate("user","username name role")
                            .populate("customer", "name phone")
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

        const doc = await Product.findById(product)
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

        const sale = await Sale.findById(id).lean()
        if(!sale){
            return res.status(404).json({
                success: false,
                message: "Sale not found with that ID!"
            })
        } 

        const totalCost = Number(sale.totalCost || 0)
        const paidAmount = Number(sale.paidAmount || 0) + additionalPaid
        const updatedSale = await Sale.findByIdAndUpdate(
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
            result: updatedSale
        })

    } catch (error) {
        next(error)
    }
}
