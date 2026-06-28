const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Shop name is required"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Shop code is required"],
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9_-]+$/, "Shop code allows only A-Z, 0-9, dash, and underscore"],
    },
    ownerAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Owner admin is required"],
    },
    businessType: {
        type: String,
        trim: true,
    },
    billingPhone: {
        type: String,
        trim: true,
    },
    billingEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    subscriptionPlan: {
        type: String,
        enum: ["Free", "Basic", "Pro"],
        default: "Free",
    },
    subscriptionPrice: {
        type: Number,
        default: 0,
    },
    subscriptionStartDate: {
        type: Date,
    },
    subscriptionExpireDate: {
        type: Date,
    },
    subscriptionPaymentStatus: {
        type: String,
        enum: ["Paid", "Unpaid", "Pending"],
        default: "Unpaid",
    },
    subscriptionStatus: {
        type: String,
        enum: ["Active", "Expired", "Suspended", "Cancelled"],
        default: "Active",
    },
    posAccess: {
        type: Boolean,
        default: true,
    },
    maxLocations: {
        type: Number,
        default: 1,
    },
    maxCashiers: {
        type: Number,
        default: 1,
    },
    maxProducts: {
        type: Number,
        default: 100,
    },
    logo: {
        type: String,
        trim: true,
    },
    defaultCurrency: {
        type: String,
        enum: ["USD", "KHR"],
        default: "USD",
    },
    provinceKh: {
        type: String,
        trim: true,
    },
    provinceEn: {
        type: String,
        trim: true,
    },
    districtKh: {
        type: String,
        trim: true,
    },
    districtEn: {
        type: String,
        trim: true,
    },
    communeKh: {
        type: String,
        trim: true,
    },
    communeEn: {
        type: String,
        trim: true,
    },
    village: {
        type: String,
        trim: true,
    },
    addressDetail: {
        type: String,
        trim: true,
    },
    fullAddressKh: {
        type: String,
        trim: true,
    },
    fullAddressEn: {
        type: String,
        trim: true,
    },
    defaultTax: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "LOCKED", "SUSPENDED", "EXPIRED", "ARCHIVED"],
        default: "ACTIVE",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    archivedAt: {
        type: Date,
        default: null,
    },
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true })

schema.index({ ownerAdminId: 1 })

module.exports = mongoose.model("Shop", schema)
