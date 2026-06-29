const { default: mongoose } = require("mongoose");


const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Shop is required"],
        index: true,
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Category is required"],
        ref: "Category"
    },
    code: {
        type: String,
        unique: true,
        required: [true, "Code product is required"]
    },
    imageUrl: {
        type: String,
        required: [true, "Image is required"]
    },
    barcode: {
        type: String,
    },
    sku: {
        type: String,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    description: {
        type: String,
        trim: true,
    },

    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    lowStockThreshold: {
        type: Number,
        min: [0, "Low stock threshold must be greater than or equal zero"],
        default: 5
    },
    reorderLevel: {
        type: Number,
        default: 5
    },
    costPrice: {
        type: Number,
        min: [0, "Cost price must be greater than or equal zero"],
        required: [true,"Cost price is required"]
    },
    salePrice: {
        type: Number,
        min: [0, "Sale price must be greater than or equal zero"],
        required: [true,"Sale price is required"]

    },
    stock: {
        type: Number,
        min: [0, "Stock must be greater than or equal zero"],
        default: 0
    },
    currentStock: {
        type: Number,
        min: [0, "Current stock must be greater than or equal zero"],
        default: 0
    },
    note:{
        type: String
    }

}, {timestamps: true})

schema.pre("validate", function syncStockFields() {
    const stock = Number(this.stock ?? this.currentStock ?? 0)
    this.stock = stock
    this.currentStock = stock

    const threshold = Number(this.lowStockThreshold ?? this.reorderLevel ?? 5)
    this.lowStockThreshold = threshold
    this.reorderLevel = threshold

    if (this.barcode === "") this.barcode = undefined;
    if (this.sku === "") this.sku = undefined;
})

schema.index({ shopId: 1, barcode: 1 }, { unique: true, sparse: true });
schema.index({ shopId: 1, sku: 1 }, { unique: true, sparse: true });
schema.index({ shopId: 1, code: 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", schema)
module.exports = Product
