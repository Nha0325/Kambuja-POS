const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, trim: true },
    type: { 
        type: String, 
        enum: ["Branch", "Warehouse", "Store"],
        default: "Branch"
    },
    province: { type: String },
    district: { type: String },
    commune: { type: String },
    village: { type: String },
    addressDetail: { type: String },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    phone: { type: String },
    allowPOS: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    shop: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Shop",
        required: true
    },
    status: { 
        type: String, 
        enum: ["ACTIVE", "INACTIVE"], 
        default: "ACTIVE" 
    }
}, { timestamps: true })

module.exports = mongoose.model("Location", schema)
