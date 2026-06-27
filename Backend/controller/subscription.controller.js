const Subscription = require("../models/Subscription.model")
const Shop = require("../models/Shop.model")
const { createAdminActivityAlert, createAlert } = require("../helper/alert.helper")

exports.getAll = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find()
            .populate("shopId", "name code")
            .populate("adminOwnerId", "username email")
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, data: subscriptions })
    } catch (error) {
        next(error)
    }
}

exports.getSummary = async (req, res, next) => {
    try {
        const [total, active, expired, unpaid] = await Promise.all([
            Subscription.countDocuments(),
            Subscription.countDocuments({ status: "ACTIVE" }),
            Subscription.countDocuments({ status: "EXPIRED" }),
            Subscription.countDocuments({ paymentStatus: "UNPAID" })
        ])
        
        const revenueAgg = await Subscription.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ])
        const totalRevenue = revenueAgg[0]?.total || 0

        res.status(200).json({
            success: true,
            data: { total, active, expired, unpaid, totalRevenue }
        })
    } catch (error) {
        next(error)
    }
}

exports.create = async (req, res, next) => {
    try {
        const sub = await Subscription.create(req.body)
        res.status(201).json({ success: true, data: sub })
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const oldSub = await Subscription.findById(req.params.id);
        const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" })
        
        await createAdminActivityAlert(req.user, "Subscription changed", `Subscription for shop ${sub.shopId} changed to ${sub.status}.`, { shopId: sub.shopId, subscriptionId: sub._id });
        
        if (oldSub && oldSub.status !== sub.status) {
            if (sub.status === 'EXPIRED') {
                await createAlert({
                    type: 'SUBSCRIPTION_EXPIRY',
                    severity: 'WARNING',
                    title: 'Shop subscription expired',
                    message: `Shop subscription expired.`,
                    shopId: sub.shopId
                });
            } else if (sub.status === 'ACTIVE' && oldSub.status !== 'ACTIVE') {
                await createAdminActivityAlert(req.user, "Subscription renewed", `Shop subscription renewed.`, { shopId: sub.shopId });
            } else if (sub.status === 'SUSPENDED') {
                await createAdminActivityAlert(req.user, "Subscription suspended", `Shop subscription suspended.`, { shopId: sub.shopId });
            }
        }
        
        res.status(200).json({ success: true, data: sub })
    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const sub = await Subscription.findByIdAndDelete(req.params.id)
        if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" })
        res.status(200).json({ success: true, data: sub })
    } catch (error) {
        next(error)
    }
}
