const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    templateName: {
        type: String,
        required: [true, "Template name is required"]
    },
    baseUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: [true, "Base unit is required"]
    },
    purchaseUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: [true, "Purchase unit is required"]
    },
    unitsPerPurchaseUnit: {
        type: Number,
        required: [true, "Units per purchase unit is required"],
        min: [0.0001, "Must be greater than 0"]
    },
    exampleText: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("UnitConversionTemplate", schema);
