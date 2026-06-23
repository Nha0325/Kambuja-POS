const HeldBill = require("../models/HeldBill.model");

const generateHoldNumber = () => {
  return "HB-" + Math.floor(100000 + Math.random() * 900000);
}

exports.create = async (req, res, next) => {
    try {
        const { items, totalCost, customerName, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const holdNumber = generateHoldNumber();

        const heldBill = await HeldBill.create({
            shopId: req.shopId,
            cashier: req.user._id,
            holdNumber,
            customerName,
            note,
            items,
            totalCost
        });

        res.status(201).json({ success: true, result: heldBill });
    } catch (error) {
        next(error);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const query = { shopId: req.shopId, status: "HELD" };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        const docs = await HeldBill.find(query).sort({ createdAt: -1 });

        res.status(200).json({ success: true, result: docs });
    } catch (error) {
        next(error);
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const query = { _id: req.params.id, shopId: req.shopId };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        const doc = await HeldBill.findOne(query);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Held bill not found" });
        }

        res.status(200).json({ success: true, result: doc });
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const query = { _id: req.params.id, shopId: req.shopId };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        const doc = await HeldBill.findOneAndUpdate(
            query,
            { status: "CANCELLED" },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ success: false, message: "Held bill not found" });
        }

        res.status(200).json({ success: true, result: doc });
    } catch (error) {
        next(error);
    }
};

exports.complete = async (req, res, next) => {
    try {
        const { completedSale } = req.body;
        const query = { _id: req.params.id, shopId: req.shopId };
        if (req.user && req.user.role === "CASHIER") {
            query.cashier = req.user._id;
        }

        const doc = await HeldBill.findOneAndUpdate(
            query,
            { status: "COMPLETED", completedSale },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ success: false, message: "Held bill not found" });
        }

        res.status(200).json({ success: true, result: doc });
    } catch (error) {
        next(error);
    }
};
