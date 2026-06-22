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
    quantity: {
        type: Number,
        min: 0,
        default: 0,
    },
    reorderLevel: {
        type: Number,
        min: 0,
        default: 5,
    },
}, { timestamps: true })

schema.index({ shopId: 1, product: 1 }, { unique: true })

module.exports = mongoose.model("Inventory", schema)
