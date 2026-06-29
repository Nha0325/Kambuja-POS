const NotificationChannel = require('../models/engagement/NotificationChannel.model')
const NotificationLog = require('../models/engagement/NotificationLog.model')
const { sendTelegramMessage } = require("./telegram.service")

const notifySaleCreated = async (sale) => {
    const channel = await NotificationChannel.findOne({
        shopId: sale.shopId,
        type: "TELEGRAM",
        enabled: true,
    })

    const message = [
        `Sale ${sale.invoiceNumber}`,
        `Total: ${Number(sale.totalCost || 0).toLocaleString()}`,
        `Payment: ${sale.paymentStatus}`,
    ].join("\n")

    const log = await NotificationLog.create({
        shopId: sale.shopId,
        channel: channel ? channel._id : null,
        eventType: "SALE_CREATED",
        status: channel ? "PENDING" : "FAILED",
        message,
        error: channel ? null : "No active channel configured",
    })

    if (channel) {
        try {
            await sendTelegramMessage({ chatId: channel.chatId, message })
            log.status = "SENT"
        } catch (error) {
            log.status = "FAILED"
            log.error = error.message
        }
        await log.save()
    }
}

const notifyLogin = async (user, req) => {
    const shopId = user.shopId?._id || user.shopId;
    if (!shopId) return;

    const channel = await NotificationChannel.findOne({
        shopId,
        type: "TELEGRAM",
        enabled: true,
    })

    const roleName = user.role === 'ADMIN_MANAGER' ? 'Admin Manager' : user.role === 'ADMIN' ? 'Admin' : 'Cashier';
    const message = [
        `[LOGIN] ${roleName}`,
        `${user.username || user.email} logged in.`,
    ].join("\n")

    const log = await NotificationLog.create({
        shopId,
        channel: channel ? channel._id : null,
        eventType: "LOGIN",
        status: channel ? "PENDING" : "FAILED",
        message,
        error: channel ? null : "No active channel configured",
    })

    if (channel) {
        try {
            await sendTelegramMessage({ chatId: channel.chatId, message })
            log.status = "SENT"
        } catch (error) {
            log.status = "FAILED"
            log.error = error.message
        }
        await log.save()
    }
}

module.exports = {
    notifySaleCreated,
    notifyLogin,
}
