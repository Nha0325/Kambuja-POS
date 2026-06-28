const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Shop is required"],
        index: true,
    },
    businessName: {
        type: String,
        required: [true, ' name is required'],
        trim: true
    },
    name: {
        type: String,
        required: [true, ' name is required'],
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Supplier phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },
    note: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

supplierSchema.index({ shopId: 1, phone: 1 }, { unique: true })

const SupplierModel = mongoose.model('Supplier', supplierSchema);

module.exports = SupplierModel;
