const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"]
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: [true, "customer is required"]
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: [true, "invoice number is required"]
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
    }

}, { timestamps: true })

const Sale = mongoose.model("Sale",schema)

module.exports = Sale