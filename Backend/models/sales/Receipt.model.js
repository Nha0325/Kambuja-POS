const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        required: true,
        unique: true,
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true,
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    printedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true })

module.exports = mongoose.model("Receipt", schema)
