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
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    method: {
        type: String,
        enum: ["CASH", "CARD", "BANK", "OTHER"],
        default: "CASH",
    },
    status: {
        type: String,
        enum: ["COMPLETED", "VOID"],
        default: "COMPLETED",
    },
}, { timestamps: true })

module.exports = mongoose.model("Payment", schema)
