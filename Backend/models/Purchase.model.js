const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Shop is required"],
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"]
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: [true, "Supplier is required"]
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: [true, "invoice number is required"]
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
        required: [true, "Purchase date is required"]
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product is required"]
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            unitPrice: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }

        }
    ],
    totalCost: {
        type: Number,
        min: [0, "total cost can't be negative"],
        required: [true, "total cost is required"]

    },
    paidAmount: {
        type: Number,
        default: 0,
        min: [0, "Paid amount can't be negative"]
    },
    dueAmount: {
        type: Number,
        default: 0,
        min: [0, "Due amount can't be negative"]
    },
    changeAmount: {
        type: Number,
        default: 0,
        min: [0, "Change amount can't be negative"]
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "due", "partial"],
        required: true
    },
    purchaseStatus: {
        type: String,
        enum: ["received", "ordered", "pending","cancel"],
        required: true
    }

}, { timestamps: true })

const Purchase = mongoose.model("Purchase",schema)

module.exports = Purchase
