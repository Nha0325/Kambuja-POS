const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        index: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["RECEIVE_STOCK", "SALE", "STOCK_ADJUSTMENT", "RETURN", "CANCEL_SALE", "STOCK_IN", "ADJUSTMENT"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    qtyChange: {
        type: Number,
    },

    quantityBefore: {
        type: Number,
        required: true,
    },
    beforeQty: {
        type: Number,
    },
    quantityAfter: {
        type: Number,
        required: true,
    },
    afterQty: {
        type: Number,
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
    },
    invoiceNo: {
        type: String,
        trim: true,
    },
    reason: {
        type: String,
        trim: true,
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

schema.pre("validate", function syncMovementAliases() {
    this.productId = this.productId || this.product
    this.createdBy = this.createdBy || this.user

    const qtyChange = Number(this.qtyChange ?? this.quantity ?? 0)
    this.qtyChange = qtyChange
    this.quantity = qtyChange

    const beforeQty = Number(this.beforeQty ?? this.quantityBefore ?? 0)
    this.beforeQty = beforeQty
    this.quantityBefore = beforeQty

    const afterQty = Number(this.afterQty ?? this.quantityAfter ?? 0)
    this.afterQty = afterQty
    this.quantityAfter = afterQty
})

module.exports = mongoose.model("StockMovement", schema)
