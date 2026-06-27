const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { 
        type: String, 
        enum: ['LOGIN', 'FAILED_LOGIN', 'LOW_STOCK', 'CRITICAL_STOCK', 'OUT_OF_STOCK', 'SUSPICIOUS_ACTIVITY', 'SUBSCRIPTION_EXPIRY', 'ADMIN_ACTIVITY'], 
        required: true 
    },
    severity: { 
        type: String, 
        enum: ['INFO', 'WARNING', 'CRITICAL'], 
        default: 'INFO' 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    status: { type: String, enum: ['unread', 'read', 'resolved'], default: 'unread' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("Alert", AlertSchema);
