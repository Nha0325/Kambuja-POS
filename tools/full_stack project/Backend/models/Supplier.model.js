const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
        unique: true,
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

const SupplierModel = mongoose.model('Supplier', supplierSchema);

module.exports = SupplierModel;