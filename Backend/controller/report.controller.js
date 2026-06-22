
const Product = require("../models/Product.model")
const Purchase = require("../models/Purchase.model")
const Sale = require("../models/Sale.model")
const Supplier = require("../models/Supplier.model")

exports.generalReport = async (req, res, next) => {
    try {
        // 1). find revenue today
        const startOfToday = new Date( new Date().setHours(0,0,0,0))
        const endOfToday = new Date( new Date().setHours(23,59,59,999))
        const todaySales = await Sale.find({
            ...req.shopFilter,
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
            ...req.shopFilter,
            paymentStatus: 'due'
        },{
            totalCost: 1
        })

        const totalDueAmountSale = dueSales.reduce((sum, sale) => {
            return sum + sale.totalCost;
        },0)

        //3). total due amount purchase
        const duePurchaes = await Purchase.find({
            ...req.shopFilter,
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
            ...req.shopFilter,
            createdAt: {
                $gte: monthStart,
                $lte: monthEnd
            }
        }, { totalCost: 1 })

        const totalMonthlySale = monthlySales.reduce((sum, sale) => {
            return sum + sale.totalCost;
        },0)

        //5). count all suppliers
        const totalSuppliers = await Supplier.countDocuments(req.shopFilter)
        //6). count all due purchase
        const totalPurchase = await Purchase.countDocuments({...req.shopFilter, paymentStatus: "due"})
        //7). count all due sale
        const totalSaleDue = await Sale.countDocuments({...req.shopFilter, paymentStatus: "due"})

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

        const startDate = new Date(req.query.startDate).setHours(0,0,0,0)
        const endDate = new Date(req.query.endDate).setHours(23,59,59,999)
        const sales = await Sale.find({
            ...req.shopFilter,
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
        if(!req.query?.stockQty){
            return res.status(400).json({
                success: false,
                error:"please provide stock qty"
            })
        }

        const docs = await Product.find({
            ...req.shopFilter,
            currentStock: {
                $lte: req.query.stockQty * 1
            }

        }).populate("category", "name")

        res.status(200).json({
            success: true,
            result: docs
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

        const sales = await Sale.aggregate([
            {
                $match: {
                    ...req.shopFilter,
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
