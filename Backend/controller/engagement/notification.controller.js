const NotificationChannel = require('../../models/engagement/NotificationChannel.model')
const NotificationLog = require('../../models/engagement/NotificationLog.model')

exports.listChannels = async (req, res, next) => {
    try {
        const docs = await NotificationChannel.find(req.shopFilter).sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.saveChannel = async (req, res, next) => {
    try {
        const type = String(req.body.type || "TELEGRAM").toUpperCase()
        const channel = await NotificationChannel.findOneAndUpdate(
            { shopId: req.shopId, type },
            {
                shopId: req.shopId,
                type,
                chatId: req.body.chatId,
                enabled: req.body.enabled !== false,
            },
            { new: true, upsert: true, runValidators: true }
        )
        res.status(200).json({ success: true, result: channel })
    } catch (error) {
        next(error)
    }
}

exports.removeChannel = async (req, res, next) => {
    try {
        const channel = await NotificationChannel.findOneAndDelete({
            _id: req.params.id,
            ...req.shopFilter,
        })
        if (!channel) {
            return res.status(404).json({ success: false, error: "Channel not found" })
        }
        return res.status(200).json({ success: true, result: channel })
    } catch (error) {
        next(error)
    }
}

exports.listLogs = async (req, res, next) => {
    try {
        const docs = await NotificationLog.find(req.shopFilter)
            .populate("channel", "type chatId enabled")
            .sort({ createdAt: -1 })
            .limit(500)
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}
