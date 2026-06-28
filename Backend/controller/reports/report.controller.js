const Product = require('../../models/inventory/Product.model')
const Purchase = require('../../models/purchase/Purchase.model')
const Sale = require('../../models/sales/Sale.model')
const Supplier = require('../../models/purchase/Supplier.model')
const StockMovement = require('../../models/misc/StockMovement.model')

exports.generalReport = async (req, res, next) => {
    try {
        // 1). find revenue today
        const startOfToday = new Date( new Date().setHours(0,0,0,0))
        const endOfToday = new Date( new Date().setHours(23,59,59,999))
        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId

        const todaySales = await Sale.find({
            ...filter,
            createdAt: {
                 $gte: startOfToday,
                 $lte: endOfToday
            }
        },{
            totalCost: 1
        })
        const totalSaleToday = todaySales.reduce((sum, sale) => {
            return sum + sale.totalCost;

        },0)

        // 2). total due amount
        const dueSales = await Sale.find({
            ...filter,
            paymentStatus: 'due'
        },{
            totalCost: 1
        })

        const totalDueAmountSale = dueSales.reduce((sum, sale) => {
            return sum + sale.totalCost;
        },0)

        //3). total due amount purchase
        const duePurchaes = await Purchase.find({
            ...filter,
            paymentStatus: 'due'
        },{totalCost: 1})
        const totalDueAmountPurchase = duePurchaes.reduce((sum, purchase) => {
            return sum + purchase.totalCost;
        },0)

        //4). monthly sale
        const monthStart = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        ).setHours(0,0,0,0)

        const monthEnd = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0
        ).setHours(23,59,59,999)

        const monthlySales = await Sale.find({
            ...filter,
            createdAt: {
                $gte: monthStart,
                $lte: monthEnd
            }
        }, { totalCost: 1 })

        const totalMonthlySale = monthlySales.reduce((sum, sale) => {
            return sum + sale.totalCost;
        },0)

        //5). count all suppliers
        const totalSuppliers = await Supplier.countDocuments(filter)
        //6). count all due purchase
        const totalPurchase = await Purchase.countDocuments({...filter, paymentStatus: "due"})
        //7). count all due sale
        const totalSaleDue = await Sale.countDocuments({...filter, paymentStatus: "due"})

        res.status(200).json({
            success: true,
            result: {
                totalSaleToday,
                totalDueAmountSale,
                totalDueAmountPurchase,
                totalMonthlySale,
                totalSuppliers,
                totalPurchase,
                totalSaleDue  
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.saleReport = async (req, res, next) => {
    try {
        

    if(!req.query?.startDate || !req.query?.endDate){
        return res.status(400).json({
            success: false,
            error: "Start date and End date are required"
        })
        
    }

        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId

        const startDate = new Date(req.query.startDate).setHours(0,0,0,0)
        const endDate = new Date(req.query.endDate).setHours(23,59,59,999)
        const sales = await Sale.find({
            ...filter,
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .populate("user", "username email role")

        const totalAmount = sales.reduce((sum, sale) => {
            return sum + sale.totalCost
        },0)

    
        res.status(200).json({
            success:true,
            totalAmount,
            result: sales
        })
    } catch (error) {
        next(error)
    }
}

exports.stockReport = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter, isDeleted: false }
        
        if (req.query.shopId && (!req.user.shopId || req.user.role === 'ADMIN_MANAGER')) {
            filter.shopId = req.query.shopId
        }

        if (req.query.categoryId) filter.category = req.query.categoryId
        if (req.query.supplierId) filter.supplier = req.query.supplierId
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i')
            filter.$or = [
                { name: searchRegex },
                { sku: searchRegex },
                { barcode: searchRegex },
                { code: searchRegex }
            ]
        }

        const products = await Product.find(filter)
            .populate("shopId", "name")
            .populate("category", "name")
            .populate("supplier", "name")
            .lean()

        const productIds = products.map(p => p._id)

        const smFilter = { productId: { $in: productIds } }
        
        if (req.query.dateFrom || req.query.dateTo) {
            smFilter.createdAt = {}
            if (req.query.dateFrom) {
                smFilter.createdAt.$gte = new Date(new Date(req.query.dateFrom).setHours(0,0,0,0))
            }
            if (req.query.dateTo) {
                smFilter.createdAt.$lte = new Date(new Date(req.query.dateTo).setHours(23,59,59,999))
            }
        }

        const movements = await StockMovement.aggregate([
            { $match: smFilter },
            {
                $group: {
                    _id: "$productId",
                    receivedQty: {
                        $sum: { $cond: [{ $eq: ["$type", "RECEIVE_STOCK"] }, "$qtyChange", 0] }
                    },
                    soldQty: {
                        $sum: { $cond: [{ $eq: ["$type", "SALE"] }, "$qtyChange", 0] }
                    },
                    adjustedQty: {
                        $sum: { $cond: [{ $eq: ["$type", "STOCK_ADJUSTMENT"] }, "$qtyChange", 0] }
                    },
                    lastMovementAt: { $max: "$createdAt" }
                }
            }
        ])

        const movementMap = {}
        movements.forEach(m => {
            movementMap[m._id.toString()] = m
        })

        let totalProducts = 0
        let totalStockQuantity = 0
        let totalStockValue = 0
        let totalLowStock = 0
        let totalOutOfStock = 0
        let totalReceivedQty = 0
        let totalSoldQty = 0
        let totalAdjustedQty = 0

        let result = products.map(p => {
            const currentStock = p.currentStock || 0
            const costPerBaseUnit = p.pricing?.costPerBaseUnit || p.costPrice || 0
            const stockValue = currentStock * costPerBaseUnit
            const lowStockThreshold = p.lowStockThreshold || 0
            
            let stockStatus = 'IN_STOCK'
            if (currentStock <= 0) {
                stockStatus = 'OUT_OF_STOCK'
            } else if (currentStock <= lowStockThreshold) {
                stockStatus = 'LOW_STOCK'
            }

            const mov = movementMap[p._id.toString()] || {}
            const receivedQty = mov.receivedQty || 0
            const soldQty = Math.abs(mov.soldQty || 0)
            const adjustedQty = mov.adjustedQty || 0
            const lastMovementAt = mov.lastMovementAt || null

            return {
                productId: p._id,
                productName: p.name,
                shopId: p.shopId?._id,
                shopName: p.shopId?.name,
                sku: p.sku || p.code,
                barcode: p.barcode,
                categoryName: p.category?.name,
                supplierName: p.supplier?.name,
                currentStock,
                lowStockThreshold,
                stockStatus,
                costPerBaseUnit,
                stockValue,
                receivedQty,
                soldQty,
                adjustedQty,
                lastMovementAt
            }
        })

        if (req.query.status) {
            result = result.filter(r => r.stockStatus === req.query.status)
        }

        result.forEach(r => {
            totalProducts++
            totalStockQuantity += r.currentStock
            totalStockValue += r.stockValue
            if (r.stockStatus === 'LOW_STOCK') totalLowStock++
            if (r.stockStatus === 'OUT_OF_STOCK') totalOutOfStock++
            totalReceivedQty += r.receivedQty
            totalSoldQty += r.soldQty
            totalAdjustedQty += r.adjustedQty
        })

        res.status(200).json({
            success: true,
            summary: {
                totalProducts,
                totalStockQuantity,
                totalStockValue,
                lowStockProducts: totalLowStock,
                outOfStockProducts: totalOutOfStock,
                receivedQty: totalReceivedQty,
                soldQty: totalSoldQty,
                adjustedQty: totalAdjustedQty
            },
            result
        })
    } catch (error) {
        next(error)
    }
}

exports.salereportIn30Days = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 )
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        const filter = { ...req.shopFilter }
        if (req.query.locationId) filter.locationId = req.query.locationId

        const sales = await Sale.aggregate([
            {
                $match: {
                    ...filter,
                    createdAt: {
                        $gte: thirtyDaysAgo
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    totalSale: { $sum: "$totalCost" },
                    saleCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const salesByDate = sales.reduce((acc, sale) => {
            acc[sale._id] = sale
            return acc
        }, {})

        const result = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const key = date.toISOString().slice(0, 10)

            result.push({
                date: key,
                name: date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                }),
                totalSale: salesByDate[key]?.totalSale || 0,
                saleCount: salesByDate[key]?.saleCount || 0
            })
        }
        
        res.status(200).json({
            success: true,
            result           
        })
    } catch (error) {
        next(error)
    }
}
