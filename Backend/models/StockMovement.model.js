const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["STOCK_IN", "SALE", "ADJUSTMENT", "RETURN"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    quantityBefore: {
        type: Number,
        required: true,
    },
    quantityAfter: {
        type: Number,
        required: true,
    },
    referenceType: {
        type: String,
        trim: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    note: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

module.exports = mongoose.model("StockMovement", schema)
