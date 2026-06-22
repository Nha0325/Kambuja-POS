const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["TELEGRAM"],
        default: "TELEGRAM",
    },
    chatId: {
        type: String,
        required: true,
        trim: true,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true })

schema.index({ shopId: 1, type: 1 }, { unique: true })

module.exports = mongoose.model("NotificationChannel", schema)
