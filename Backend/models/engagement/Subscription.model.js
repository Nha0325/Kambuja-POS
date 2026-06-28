const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
        index: true,
    },
    adminOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    planName: {
        type: String,
        enum: ["Basic", "Standard", "Premium", "Custom"],
        default: "Basic",
    },
    price: {
        type: Number,
        default: 0,
    },
    billingCycle: {
        type: String,
        enum: ["Monthly", "Yearly"],
        default: "Monthly",
    },
    startDate: {
        type: Date,
        required: true,
    },
    expireDate: {
        type: Date,
        required: true,
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ["Paid", "Unpaid", "Partial", "Overdue"],
        default: "Unpaid",
    },
    status: {
        type: String,
        enum: ["Active", "Expired", "Suspended", "Cancelled", "Trial"],
        default: "Trial",
        index: true,
    },
    note: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true })

module.exports = mongoose.model("Subscription", schema)
