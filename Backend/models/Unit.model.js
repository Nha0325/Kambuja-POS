const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    nameKh: {
        type: String,
        required: [true, "Khmer name is required"]
    },
    nameEn: {
        type: String,
        required: [true, "English name is required"]
    },
    code: {
        type: String,
        required: [true, "Code is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["BASE", "PURCHASE", "SALE", "BOTH"],
        default: "BOTH"
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

module.exports = mongoose.model("Unit", schema);
