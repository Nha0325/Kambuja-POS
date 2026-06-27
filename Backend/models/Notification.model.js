const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL", "SUCCESS"], default: "INFO" },
    roleTarget: { type: String, default: "ADMIN_MANAGER" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
