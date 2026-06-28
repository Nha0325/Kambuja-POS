const NotificationChannel = require('../models/engagement/NotificationChannel.model')
const NotificationLog = require('../models/engagement/NotificationLog.model')
const { sendTelegramMessage } = require("./telegram.service")

const notifySaleCreated = async (sale) => {
    const channel = await NotificationChannel.findOne({
        shopId: sale.shopId,
        type: "TELEGRAM",
        enabled: true,
    })
    if (!channel) return

    const message = [
        `Sale ${sale.invoiceNumber}`,
        `Total: ${Number(sale.totalCost || 0).toLocaleString()}`,
        `Payment: ${sale.paymentStatus}`,
    ].join("\n")

    const log = await NotificationLog.create({
        shopId: sale.shopId,
        channel: channel._id,
        eventType: "SALE_CREATED",
        status: "PENDING",
        message,
    })

    try {
        await sendTelegramMessage({ chatId: channel.chatId, message })
        log.status = "SENT"
    } catch (error) {
        log.status = "FAILED"
        log.error = error.message
    }
    await log.save()
}

module.exports = {
    notifySaleCreated,
}
