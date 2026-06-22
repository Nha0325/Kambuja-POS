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
    phone: {
        type: String,
        trim: true,
        validate: {
            validator(value) {
                return !value || /^[0-9+()\-\s]{6,20}$/.test(value)
            },
            message: "Phone number is invalid",
        },
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    provinceCode: {
        type: String,
        trim: true,
    },
    provinceName: {
        type: String,
        trim: true,
    },
    districtCode: {
        type: String,
        trim: true,
    },
    districtName: {
        type: String,
        trim: true,
    },
    communeCode: {
        type: String,
        trim: true,
    },
    communeName: {
        type: String,
        trim: true,
    },
    villageCode: {
        type: String,
        trim: true,
    },
    villageName: {
        type: String,
        trim: true,
    },
    addressDetail: {
        type: String,
        trim: true,
    },
    province: {
        type: String,
        required: [true, "Province / Capital is required"],
        trim: true,
    },
    city: {
        type: String,
        required: [true, "District / Municipality / Khan is required"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, { timestamps: true })

schema.index({ ownerAdminId: 1 })

module.exports = mongoose.model("Shop", schema)
