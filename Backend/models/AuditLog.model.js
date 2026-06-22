const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    entityType: {
        type: String,
        required: true,
        trim: true,
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true })

module.exports = mongoose.model("AuditLog", schema)
