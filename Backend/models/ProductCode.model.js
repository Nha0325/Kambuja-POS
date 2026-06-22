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
        index: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["BARCODE", "QR", "SKU"],
        default: "BARCODE",
    },
}, { timestamps: true })

schema.index({ shopId: 1, code: 1 }, { unique: true })

module.exports = mongoose.model("ProductCode", schema)
