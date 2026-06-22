const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotificationChannel",
        default: null,
    },
    eventType: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "SENT", "FAILED"],
        default: "PENDING",
    },
    message: {
        type: String,
        required: true,
    },
    error: {
        type: String,
        default: null,
    },
}, { timestamps: true })

module.exports = mongoose.model("NotificationLog", schema)
