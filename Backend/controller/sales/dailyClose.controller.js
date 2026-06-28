const DailyClose = require('../../models/sales/DailyClose.model');
const Sale = require('../../models/sales/Sale.model');

exports.getCurrent = async (req, res, next) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const query = { 
            shopId: req.shopId, 
            status: "CLOSED",
            createdAt: { $gte: start, $lte: end }
        };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        let doc = await DailyClose.findOne(query).sort({ createdAt: -1 });

        const salesQuery = {
            shopId: req.shopId,
            user: req.user._id,
            createdAt: { $gte: start, $lte: end }
        };

        const sales = await Sale.find(salesQuery);

        const salesCount = sales.length;
        const totalSales = sales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
        const paidAmount = sales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
        const dueAmount = sales.reduce((sum, s) => sum + Number(s.dueAmount || 0), 0);
        const cashExpected = paidAmount;

        res.status(200).json({
            success: true,
            result: doc, // Will be the closed session if already closed today
            preview: {
                salesCount,
                totalSales,
                paidAmount,
                dueAmount,
                cashExpected
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.open = async (req, res, next) => {
    try {
        const query = { shopId: req.shopId, cashier: req.user._id, status: "OPEN" };
        const existing = await DailyClose.findOne(query);

        if (existing) {
            return res.status(400).json({ success: false, message: "Shift is already open." });
        }

        const doc = await DailyClose.create({
            shopId: req.shopId,
            cashier: req.user._id,
            status: "OPEN"
        });

        res.status(201).json({ success: true, result: doc });
    } catch (error) {
        next(error);
    }
};

exports.close = async (req, res, next) => {
    try {
        const { cashCounted, note } = req.body;

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const salesQuery = {
            shopId: req.shopId,
            user: req.user._id,
            createdAt: { $gte: start, $lte: end }
        };

        const sales = await Sale.find(salesQuery);

        const salesCount = sales.length;
        const totalSales = sales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
        const paidAmount = sales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
        const dueAmount = sales.reduce((sum, s) => sum + Number(s.dueAmount || 0), 0);
        const cashExpected = paidAmount;
        const difference = Number(cashCounted || 0) - cashExpected;

        const doc = await DailyClose.create({
            shopId: req.shopId,
            cashier: req.user._id,
            status: "CLOSED",
            closedAt: new Date(),
            salesCount,
            totalSales,
            paidAmount,
            dueAmount,
            cashExpected,
            cashCounted: Number(cashCounted || 0),
            difference,
            note
        });

        res.status(200).json({ success: true, result: doc });
    } catch (error) {
        next(error);
    }
};

exports.history = async (req, res, next) => {
    try {
        const query = { shopId: req.shopId };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        const docs = await DailyClose.find(query).sort({ closedAt: -1, createdAt: -1 });

        res.status(200).json({ success: true, result: docs });
    } catch (error) {
        next(error);
    }
};
